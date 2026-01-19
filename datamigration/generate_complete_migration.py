#!/usr/bin/env python3
"""
Generate complete SQL migration for ALL 280 extracted records.
Uses improved investor matching strategies.
"""

import json
from collections import defaultdict

DATA_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/extracted_data_v2.json"
OUTPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/migration_complete_v2.sql"

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

def escape_sql(val):
    """Escape SQL string."""
    if val is None:
        return None
    return str(val).replace("'", "''")

def percent_to_bps(pct):
    """Convert percentage to basis points."""
    if pct is None:
        return None
    return int(pct * 10000)

def build_investor_condition(rec):
    """
    Build investor matching condition with multiple strategies.
    Returns SQL condition string.
    """
    conditions = []

    last_name = rec.get("investor_last_name")
    first_name = rec.get("investor_first_name")
    entity = rec.get("investor_entity")

    # Strategy 1: Exact last_name match (most reliable)
    if last_name and last_name.strip():
        conditions.append(f"UPPER(i.last_name) = '{escape_sql(last_name.strip().upper())}'")

    # Strategy 2: Entity/first_name contains match (for entities without last_name)
    if first_name and len(first_name.strip()) > 3:
        # Clean up entity names - they might have special chars
        clean_name = escape_sql(first_name.strip())
        # Match on legal_name for entities
        conditions.append(f"UPPER(i.legal_name) LIKE '%{clean_name.upper()}%'")

    # Strategy 3: If we have entity info that's different from vehicle code
    if entity and entity.strip() and not entity.startswith("VC"):
        conditions.append(f"UPPER(i.legal_name) LIKE '%{escape_sql(entity.strip().upper())}%'")

    if not conditions:
        return None

    return " OR ".join(conditions)

def main():
    # Load data
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    lines = []
    lines.append("-- VERSO Complete Introducer Commission Migration v2")
    lines.append("-- Fixes: Improved investor matching for all 280 records")
    lines.append(f"-- Total records in source: {data['summary']['total_records']}")
    lines.append("-- ")
    lines.append("")

    # Statistics tracking
    stats = {
        "total_records": 0,
        "spread_inserts": 0,
        "invested_amount_inserts": 0,
        "performance_fee_inserts": 0,
        "skipped_no_introducer": 0,
        "skipped_no_investor_match": 0,
        "skipped_no_fees": 0,
    }

    # Process each vehicle
    for vehicle_code, vehicle_data in data.get("data", {}).items():
        records = vehicle_data.get("records", [])
        if not records:
            continue

        lines.append(f"-- ============================================")
        lines.append(f"-- {vehicle_code}: {len(records)} records")
        lines.append(f"-- ============================================")
        lines.append("")

        for rec in records:
            stats["total_records"] += 1
            row_idx = rec.get("row_index", "?")

            # Get introducer
            introducer_name = rec.get("introducer_name")
            introducer_id = INTRODUCER_MAP.get(introducer_name)

            if not introducer_id:
                lines.append(f"-- SKIP Row {row_idx}: Unknown introducer '{introducer_name}'")
                stats["skipped_no_introducer"] += 1
                continue

            # Build investor condition
            investor_condition = build_investor_condition(rec)
            if not investor_condition:
                lines.append(f"-- SKIP Row {row_idx}: No investor identifier")
                stats["skipped_no_investor_match"] += 1
                continue

            # Get investor display name for notes
            last_name = rec.get("investor_last_name") or ""
            first_name = rec.get("investor_first_name") or ""
            investor_display = (last_name or first_name or "Unknown").strip()

            # Get fee values
            spread_fees = rec.get("spread_pps_fees")
            spread_pps = rec.get("spread_pps")
            sub_fee_amt = rec.get("sub_fee_amt")
            sub_fee_pct = rec.get("sub_fee_pct")
            perf_fee_1 = rec.get("perf_fee_1_pct")
            thresh_1 = rec.get("thresh_1")

            has_fees = False

            # Generate spread commission INSERT
            if spread_fees is not None and spread_fees > 0:
                has_fees = True
                rate_bps = int(spread_pps * 100) if spread_pps else 0
                lines.append(f"-- Row {row_idx}: {introducer_name} -> {investor_display} | Spread ${spread_fees:.2f} @ {rate_bps}bps")
                lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'spread', {rate_bps}, {spread_fees:.2f},
    'Dashboard migration v2: {vehicle_code} row {row_idx} - {escape_sql(introducer_name)}'
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
        AND ic.accrual_amount = {spread_fees:.2f}
  )
LIMIT 1;
""")
                stats["spread_inserts"] += 1

            # Generate invested_amount commission INSERT
            if sub_fee_amt is not None and sub_fee_amt > 0:
                has_fees = True
                rate_bps = percent_to_bps(sub_fee_pct) if sub_fee_pct else 0
                lines.append(f"-- Row {row_idx}: {introducer_name} -> {investor_display} | Sub Fee ${sub_fee_amt:.2f} @ {rate_bps}bps")
                lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'invested_amount', {rate_bps}, {sub_fee_amt:.2f},
    'Dashboard migration v2: {vehicle_code} row {row_idx} - {escape_sql(introducer_name)}'
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
        AND ic.accrual_amount = {sub_fee_amt:.2f}
  )
LIMIT 1;
""")
                stats["invested_amount_inserts"] += 1

            # Generate performance_fee commission INSERT
            if perf_fee_1 is not None and perf_fee_1 > 0:
                has_fees = True
                rate_bps = percent_to_bps(perf_fee_1)
                # Convert threshold - "0x" becomes 0, "1.5x" becomes 1.5
                thresh_val = 0
                if thresh_1 and isinstance(thresh_1, str):
                    thresh_clean = thresh_1.replace("x", "").strip()
                    try:
                        thresh_val = float(thresh_clean) if thresh_clean else 0
                    except:
                        thresh_val = 0

                lines.append(f"-- Row {row_idx}: {introducer_name} -> {investor_display} | Perf Fee {perf_fee_1*100:.1f}% @ {thresh_val}x")
                lines.append(f"""INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '{introducer_id}', s.investor_id, s.deal_id, 'performance_fee', {rate_bps}, {thresh_val}, 0,
    'Dashboard migration v2: {vehicle_code} row {row_idx} - {escape_sql(introducer_name)}'
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
LIMIT 1;
""")
                stats["performance_fee_inserts"] += 1

            if not has_fees:
                lines.append(f"-- SKIP Row {row_idx}: No fee values to migrate")
                stats["skipped_no_fees"] += 1

    # Summary at end
    lines.append("")
    lines.append("-- ============================================")
    lines.append("-- Migration Summary")
    lines.append("-- ============================================")
    lines.append(f"-- Total records processed: {stats['total_records']}")
    lines.append(f"-- Spread INSERT statements: {stats['spread_inserts']}")
    lines.append(f"-- Invested_amount INSERT statements: {stats['invested_amount_inserts']}")
    lines.append(f"-- Performance_fee INSERT statements: {stats['performance_fee_inserts']}")
    lines.append(f"-- Total INSERT statements: {stats['spread_inserts'] + stats['invested_amount_inserts'] + stats['performance_fee_inserts']}")
    lines.append(f"-- Skipped (no introducer): {stats['skipped_no_introducer']}")
    lines.append(f"-- Skipped (no investor match): {stats['skipped_no_investor_match']}")
    lines.append(f"-- Skipped (no fees): {stats['skipped_no_fees']}")

    # Write output
    with open(OUTPUT_FILE, 'w') as f:
        f.write("\n".join(lines))

    print(f"Generated: {OUTPUT_FILE}")
    print(f"Total records: {stats['total_records']}")
    print(f"INSERT statements: {stats['spread_inserts'] + stats['invested_amount_inserts'] + stats['performance_fee_inserts']}")
    print(f"  - spread: {stats['spread_inserts']}")
    print(f"  - invested_amount: {stats['invested_amount_inserts']}")
    print(f"  - performance_fee: {stats['performance_fee_inserts']}")

if __name__ == "__main__":
    main()
