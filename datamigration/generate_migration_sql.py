#!/usr/bin/env python3
"""
Generate SQL migration from extracted dashboard data.
Outputs SQL file that can be run via Supabase MCP.
"""

import json

DATA_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/extracted_data_v2.json"
OUTPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/migration_commissions.sql"

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
    """Convert percentage to basis points."""
    if pct is None:
        return None
    return int(pct * 10000)

def sql_value(val):
    """Format value for SQL."""
    if val is None:
        return "NULL"
    if isinstance(val, str):
        return f"'{val.replace(chr(39), chr(39)+chr(39))}'"  # Escape quotes
    return str(val)

def main():
    # Load data
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    lines = []
    lines.append("-- VERSO Introducer Commission Migration")
    lines.append("-- Generated from extracted dashboard data")
    lines.append("-- Total records: " + str(data['summary']['total_records']))
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")

    # Process each vehicle
    for vehicle_code, vehicle_data in data.get("data", {}).items():
        records = vehicle_data.get("records", [])
        if not records:
            continue

        lines.append(f"-- === {vehicle_code} ({len(records)} records) ===")
        lines.append("")

        for rec in records:
            introducer_name = rec.get("introducer_name")
            introducer_id = INTRODUCER_MAP.get(introducer_name)

            if not introducer_id:
                lines.append(f"-- SKIP: Unknown introducer '{introducer_name}'")
                continue

            # Get investor identifier
            last_name = rec.get("investor_last_name")
            entity = rec.get("investor_entity")
            first_name = rec.get("investor_first_name")

            # Build investor match condition
            investor_match = []
            if last_name:
                investor_match.append(f"UPPER(i.last_name) = UPPER('{last_name}')")
            if entity and entity != vehicle_code.replace("VC1", "VC"):  # Skip if entity is just vehicle code
                investor_match.append(f"i.legal_name ILIKE '%{entity}%'")
            if first_name and len(first_name) > 3:  # Only use first name if it's substantial
                investor_match.append(f"i.legal_name ILIKE '%{first_name}%'")

            if not investor_match:
                lines.append(f"-- SKIP: No investor identifier for row {rec.get('row_index')}")
                continue

            investor_condition = " OR ".join(investor_match)

            # Generate UPDATE for subscription
            lines.append(f"-- Row {rec.get('row_index')}: {introducer_name} -> {last_name or entity or first_name}")
            lines.append(f"""UPDATE subscriptions s
SET introducer_id = '{introducer_id}'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = '{vehicle_code}'
  AND ({investor_condition})
  AND s.introducer_id IS NULL;""")
            lines.append("")

            # Generate INSERT for commissions if we have spread fees
            spread_fees = rec.get("spread_pps_fees")
            spread_pps = rec.get("spread_pps")

            if spread_fees and spread_fees > 0:
                rate_bps = int(spread_pps * 100) if spread_pps else None
                lines.append(f"""-- Spread commission: ${spread_fees}
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}',
    s.investor_id,
    s.deal_id,
    'spread',
    {rate_bps if rate_bps else 'NULL'},
    {spread_fees},
    'Dashboard migration: {vehicle_code} - {last_name or entity or first_name}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}'
  AND ({investor_condition})
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '{introducer_id}'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;""")
                lines.append("")

            # Performance fee 1
            perf_fee_1 = rec.get("perf_fee_1_pct")
            thresh_1 = rec.get("thresh_1")
            if perf_fee_1 and perf_fee_1 > 0:
                rate_bps = percent_to_bps(perf_fee_1)
                lines.append(f"""-- Performance fee: {perf_fee_1*100}% @ {thresh_1}
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '{introducer_id}',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    {rate_bps},
    {sql_value(thresh_1)},
    'Dashboard migration: {vehicle_code} - {last_name or entity or first_name}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}'
  AND ({investor_condition})
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '{introducer_id}'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;""")
                lines.append("")

            # Subscription fee (invested_amount)
            sub_fee_amt = rec.get("sub_fee_amt")
            sub_fee_pct = rec.get("sub_fee_pct")
            if sub_fee_amt and sub_fee_amt > 0:
                rate_bps = percent_to_bps(sub_fee_pct)
                lines.append(f"""-- Subscription fee: ${sub_fee_amt}
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    {rate_bps if rate_bps else 'NULL'},
    {sub_fee_amt},
    'Dashboard migration: {vehicle_code} - {last_name or entity or first_name}'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = '{vehicle_code}'
  AND ({investor_condition})
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '{introducer_id}'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;""")
                lines.append("")

    lines.append("COMMIT;")

    # Write output
    with open(OUTPUT_FILE, 'w') as f:
        f.write("\n".join(lines))

    print(f"Generated SQL migration: {OUTPUT_FILE}")
    print(f"Total lines: {len(lines)}")

if __name__ == "__main__":
    main()
