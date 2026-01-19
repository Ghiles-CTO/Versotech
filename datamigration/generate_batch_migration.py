#!/usr/bin/env python3
"""
Generate efficient batch SQL migration from extracted dashboard data.
Uses bulk UPDATE and INSERT statements for better performance.
"""

import json
from collections import defaultdict

DATA_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/extracted_data_v2.json"
OUTPUT_DIR = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration"

# Introducer name to ID mapping
INTRODUCER_MAP = {
    "Aboud": "3cc51575-6b04-4d46-a1ac-e66630a50e7b",
    "Alpha Gaia": "bc23b7c7-4253-40c2-889b-97a5044c23d5",
    "Anand": "b661243f-e6b4-41f1-b239-de4b197a689a",
    "Anand Sethia": "e0e79380-89ef-457b-a45c-0c9bef2cbf01",
    "Anand+Dan": "ade750b8-011a-4fd2-a32c-30ba609b5643",
    "AUX": "0aebf77c-47a3-4011-abd4-74ee3772d78e",
    "Dan": "81e78a56-bed0-45dd-8c52-45566f5895b6",
    "Elevation": "faace30d-09ed-4974-a609-38dba914ce01",
    "Elevation+Rick": "1e77ff44-332a-4939-83f9-acf96c851f72",
    "Enguerrand": "736a31b2-b8a6-4a0e-8abe-ed986014d0c4",
    "FINSA": "5a765445-bee7-4716-96f6-e2e2ca0329c7",
    "Gemera": "61e01a81-0663-4d4a-9626-fc3a6acb4d63",
    "Gio": "bcaaab40-eef5-4a3c-92d7-101f498489ac",
    "John": "19b4ce66-494a-41e0-8221-14b230d0c5f2",
    "Julien": "8964a91a-eb92-4f65-aa47-750c417cd499",
    "Manna Capital": "a2a0b0a1-817a-4039-bcbf-160b84f51567",
    "Omar": "ae4d8764-3c68-4d34-beca-9f4fec4c71a9",
    "Pierre Paumier": "41974010-e41d-40a6-9cbf-725618e7e00c",
    "Rick": "55b67690-c83d-4406-a2b4-935032d22739",
    "Rick + Andrew": "4d17ec21-5eeb-4957-9a50-992f731ebd56",
    "Robin": "6147711e-310e-45ec-8892-ac072e25c3b0",
    "Sandro": "87571ef2-b05d-4d7d-8095-2992d43b9aa8",
    "Simone": "6c63f6f1-d916-4275-8ea8-b951e333bc64",
    "Stableton+Terra": "cca3a4b2-5a53-464a-8387-1ad326a168ed",
    "Terra": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "TERRA": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "TERRA Financial": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "VERSO BI": "98fdce26-5a61-486e-a450-8e13dd4cfbf4",
}

def percent_to_bps(pct):
    if pct is None:
        return None
    return int(pct * 10000)

def escape_sql(val):
    if val is None:
        return None
    return str(val).replace("'", "''")

def main():
    # Load data
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    # Group records by vehicle and investor
    # Key: (vehicle_code, last_name_upper OR entity)
    vehicle_investor_data = defaultdict(list)

    for vehicle_code, vehicle_data in data.get("data", {}).items():
        for rec in vehicle_data.get("records", []):
            introducer_name = rec.get("introducer_name")
            introducer_id = INTRODUCER_MAP.get(introducer_name)
            if not introducer_id:
                continue

            last_name = rec.get("investor_last_name")
            entity = rec.get("investor_first_name")  # Note: first_name often contains entity

            # Create investor key
            if last_name and last_name.strip():
                investor_key = last_name.strip().upper()
            elif entity and len(entity.strip()) > 3:
                investor_key = entity.strip().upper()
            else:
                continue

            vehicle_investor_data[(vehicle_code, investor_key)].append({
                "introducer_id": introducer_id,
                "introducer_name": introducer_name,
                "spread_fees": rec.get("spread_pps_fees"),
                "spread_pps": rec.get("spread_pps"),
                "perf_fee_1": rec.get("perf_fee_1_pct"),
                "thresh_1": rec.get("thresh_1"),
                "perf_fee_2": rec.get("perf_fee_2_pct"),
                "thresh_2": rec.get("thresh_2"),
                "sub_fee_amt": rec.get("sub_fee_amt"),
                "sub_fee_pct": rec.get("sub_fee_pct"),
            })

    print(f"Unique vehicle-investor combinations: {len(vehicle_investor_data)}")

    # Part 1: Generate UPDATE statements for subscriptions
    # Group by vehicle and introducer for efficiency
    vehicle_introducer_investors = defaultdict(set)
    for (vehicle_code, investor_key), records in vehicle_investor_data.items():
        # Use the first record's introducer (should be the same for all)
        introducer_id = records[0]["introducer_id"]
        vehicle_introducer_investors[(vehicle_code, introducer_id)].add(investor_key)

    lines = []
    lines.append("-- Part 1: Update subscriptions with introducer_id")
    lines.append("-- Total unique vehicle-introducer combinations: " + str(len(vehicle_introducer_investors)))
    lines.append("")

    for (vehicle_code, introducer_id), investors in vehicle_introducer_investors.items():
        conditions = []
        for inv in investors:
            if any(c.isalpha() and c.isupper() for c in inv):
                # Looks like a name, match on last_name
                conditions.append(f"UPPER(i.last_name) = '{escape_sql(inv)}'")
            else:
                # Match on legal_name
                conditions.append(f"UPPER(i.legal_name) LIKE '%{escape_sql(inv)}%'")

        if not conditions:
            continue

        condition_str = " OR ".join(conditions)

        lines.append(f"-- {vehicle_code} - {len(investors)} investors")
        lines.append(f"""UPDATE subscriptions s
SET introducer_id = '{introducer_id}'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = '{vehicle_code}'
  AND ({condition_str})
  AND s.introducer_id IS NULL;
""")

    # Save Part 1
    with open(f"{OUTPUT_DIR}/migration_part1_subscriptions.sql", 'w') as f:
        f.write("\n".join(lines))
    print(f"Generated: migration_part1_subscriptions.sql ({len(lines)} lines)")

    # Part 2: Generate commission INSERT statements
    # Collect all commission data
    commission_lines = []
    commission_lines.append("-- Part 2: Insert introducer commissions")
    commission_lines.append("-- Generated from dashboard data")
    commission_lines.append("")

    # Track unique commissions to avoid duplicates
    processed_commissions = set()

    for (vehicle_code, investor_key), records in vehicle_investor_data.items():
        # Use first record's introducer
        introducer_id = records[0]["introducer_id"]
        introducer_name = records[0]["introducer_name"]

        # Build investor condition
        if any(c.isalpha() and c.isupper() for c in investor_key):
            investor_condition = f"UPPER(i.last_name) = '{escape_sql(investor_key)}'"
        else:
            investor_condition = f"UPPER(i.legal_name) LIKE '%{escape_sql(investor_key)}%'"

        # Aggregate fees for this investor-introducer combo
        total_spread = sum(r.get("spread_fees") or 0 for r in records)
        spread_pps = next((r.get("spread_pps") for r in records if r.get("spread_pps")), None)
        total_sub = sum(r.get("sub_fee_amt") or 0 for r in records)
        sub_pct = next((r.get("sub_fee_pct") for r in records if r.get("sub_fee_pct")), None)
        perf_fee_1 = next((r.get("perf_fee_1") for r in records if r.get("perf_fee_1")), None)
        thresh_1 = next((r.get("thresh_1") for r in records if r.get("thresh_1")), None)

        # Spread fees
        if total_spread > 0:
            key = (vehicle_code, investor_key, introducer_id, 'spread')
            if key not in processed_commissions:
                processed_commissions.add(key)
                rate_bps = int(spread_pps * 100) if spread_pps else 'NULL'
                commission_lines.append(f"-- {vehicle_code} {investor_key}: Spread ${total_spread:.2f}")
                commission_lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'spread', {rate_bps}, {total_spread:.2f},
    'Dashboard migration: {vehicle_code} - {escape_sql(introducer_name)}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}' AND ({investor_condition}) AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '{introducer_id}' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;
""")

        # Subscription fees (invested_amount)
        if total_sub > 0:
            key = (vehicle_code, investor_key, introducer_id, 'invested_amount')
            if key not in processed_commissions:
                processed_commissions.add(key)
                rate_bps = percent_to_bps(sub_pct) if sub_pct else 'NULL'
                commission_lines.append(f"-- {vehicle_code} {investor_key}: Sub fee ${total_sub:.2f}")
                commission_lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'invested_amount', {rate_bps}, {total_sub:.2f},
    'Dashboard migration: {vehicle_code} - {escape_sql(introducer_name)}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}' AND ({investor_condition}) AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '{introducer_id}' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;
""")

        # Performance fees
        if perf_fee_1 and perf_fee_1 > 0:
            key = (vehicle_code, investor_key, introducer_id, 'performance_fee')
            if key not in processed_commissions:
                processed_commissions.add(key)
                rate_bps = percent_to_bps(perf_fee_1)
                thresh_val = f"'{escape_sql(thresh_1)}'" if thresh_1 else 'NULL'
                commission_lines.append(f"-- {vehicle_code} {investor_key}: Perf fee {perf_fee_1*100}%")
                commission_lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'performance_fee', {rate_bps}, {thresh_val},
    'Dashboard migration: {vehicle_code} - {escape_sql(introducer_name)}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}' AND ({investor_condition}) AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '{introducer_id}' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;
""")

    # Save Part 2
    with open(f"{OUTPUT_DIR}/migration_part2_commissions.sql", 'w') as f:
        f.write("\n".join(commission_lines))
    print(f"Generated: migration_part2_commissions.sql ({len(commission_lines)} lines)")
    print(f"Total unique commissions: {len(processed_commissions)}")

if __name__ == "__main__":
    main()
