#!/usr/bin/env python3
"""Prepare SQL updates/deletes for commission comment changes.

Generates:
- VERSO/datafixing/05_commission_apply_updates.sql
- VERSO/datafixing/05_commission_apply_deletes.sql
- VERSO/datafixing/05_commission_fishy_rows.csv
- VERSO/datafixing/05_commission_apply_summary.md
"""
from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

ENV_PATH = Path('.env.local')
MATCHED_CSV = Path('VERSO/datafixing/05_commission_updates_to_apply.csv')
UNMATCHED_CSV = Path('VERSO/datafixing/05_commission_unmatched_needs_review.csv')
DUP_DELETE_CSV = Path('VERSO/datafixing/05_commission_delete_duplicates_suggested.csv')

OUT_UPDATES_SQL = Path('VERSO/datafixing/05_commission_apply_updates.sql')
OUT_DELETES_SQL = Path('VERSO/datafixing/05_commission_apply_deletes.sql')
OUT_FISHY = Path('VERSO/datafixing/05_commission_fishy_rows.csv')
OUT_SUMMARY = Path('VERSO/datafixing/05_commission_apply_summary.md')


@dataclass
class CommissionSnapshot:
    id: str
    introducer_id: Optional[str]
    investor_id: Optional[str]
    basis_type: Optional[str]
    rate_bps: Optional[float]
    accrual_amount: Optional[float]
    currency: Optional[str]


def load_env(path: Path) -> dict:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        env[key.strip()] = value.strip().strip('"')
    return env


def fetch_all(base: dict, table: str, select: str, page_size: int = 1000) -> List[dict]:
    headers = {
        'apikey': base['key'],
        'Authorization': f"Bearer {base['key']}",
        'Accept': 'application/json',
    }
    results: List[dict] = []
    offset = 0
    while True:
        params = {
            'select': select,
            'order': 'id',
            'limit': page_size,
            'offset': offset,
        }
        url = f"{base['url']}/rest/v1/{table}?{urlencode(params)}"
        req = Request(url, headers=headers)
        try:
            with urlopen(req) as resp:
                payload = resp.read()
        except Exception as exc:
            if hasattr(exc, 'read'):
                error_body = exc.read().decode('utf-8', errors='ignore')
                raise RuntimeError(f"Request failed: {url}\n{error_body}") from exc
            raise
        data = json.loads(payload.decode('utf-8'))
        if not data:
            break
        results.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return results


def norm_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip().lower()
    if not text:
        return None
    text = text.replace('&', 'and')
    text = re.sub(r"\b(limited)\b", "ltd", text)
    text = re.sub(r"\b(incorporated)\b", "inc", text)
    text = re.sub(r"[^a-z0-9]+", "", text)
    return text or None


def norm_investor(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip().lower()
    if not text:
        return None
    text = re.sub(r"\([^\)]*\)", " ", text)
    text = text.replace('&', ' and ')
    text = re.sub(r"\b(limited)\b", "ltd", text)
    text = re.sub(r"\b(incorporated)\b", "inc", text)
    tokens = re.split(r"[^a-z0-9]+", text)
    stopwords = {'mr', 'mrs', 'ms', 'dr', 'and', 'of', 'the', 'on', 'behalf'}
    tokens = [t for t in tokens if t and t not in stopwords]
    if not tokens:
        return None
    tokens = sorted(tokens)
    return ''.join(tokens)


def to_float(value: Any) -> Optional[float]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(value)
    except Exception:
        return None


def rate_bps_from_pct(rate_pct: Optional[float]) -> Optional[int]:
    if rate_pct is None:
        return None
    try:
        return int(round(rate_pct * 100))
    except Exception:
        return None


def load_commission_snapshots(base: dict) -> Dict[str, CommissionSnapshot]:
    rows = fetch_all(base, 'introducer_commissions', 'id,introducer_id,investor_id,basis_type,rate_bps,accrual_amount,currency')
    snapshots: Dict[str, CommissionSnapshot] = {}
    for row in rows:
        snapshots[row['id']] = CommissionSnapshot(
            id=row['id'],
            introducer_id=row.get('introducer_id'),
            investor_id=row.get('investor_id'),
            basis_type=row.get('basis_type'),
            rate_bps=to_float(row.get('rate_bps')),
            accrual_amount=to_float(row.get('accrual_amount')),
            currency=row.get('currency'),
        )
    return snapshots


def sql_literal(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        escaped = value.replace("'", "''")
        return f"'{escaped}'"
    return str(value)


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL') or env.get('SUPABASE_URL')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('SUPABASE_SERVICE_KEY')
    if not supabase_url or not supabase_key:
        raise SystemExit('Missing Supabase URL/service key in .env.local')
    base = {'url': supabase_url.rstrip('/'), 'key': supabase_key}

    if not MATCHED_CSV.exists():
        raise SystemExit(f"Missing {MATCHED_CSV}")

    matched = pd.read_csv(MATCHED_CSV)
    unmatched = pd.read_csv(UNMATCHED_CSV) if UNMATCHED_CSV.exists() and UNMATCHED_CSV.stat().st_size else pd.DataFrame()

    snapshots = load_commission_snapshots(base)

    updates_sql: List[str] = []
    deletes_sql: List[str] = []
    fishy_rows: List[Dict[str, Any]] = []

    # handle deletes from matched
    for _, row in matched.iterrows():
        action = str(row.get('action')).strip().lower()
        commission_id = row.get('commission_id')
        if action == 'delete':
            deletes_sql.append(f"delete from introducer_commissions where id = {sql_literal(commission_id)};")
            continue

        # updates
        snapshot = snapshots.get(commission_id)
        if snapshot is None:
            fishy_rows.append({**row.to_dict(), 'fishy_reason': 'COMMISSION_NOT_FOUND'})
            continue

        # compute desired values
        fee_type = (str(row.get('fee_type_comment')).strip().lower() if row.get('fee_type_comment') is not None else None)
        rate_bps = to_float(row.get('rate_bps_comment'))
        rate_pct = to_float(row.get('rate_pct_comment'))
        if rate_bps is None and rate_pct is not None:
            rate_bps = rate_bps_from_pct(rate_pct)
        amount = to_float(row.get('amount_comment'))
        currency = row.get('currency_comment') if isinstance(row.get('currency_comment'), str) and row.get('currency_comment') else None

        introducer_name = row.get('introducer_comment') if isinstance(row.get('introducer_comment'), str) else None
        investor_name = row.get('investor_comment') if isinstance(row.get('investor_comment'), str) else None
        introducer_db = row.get('introducer_db') if isinstance(row.get('introducer_db'), str) else None
        investor_db = row.get('investor_db') if isinstance(row.get('investor_db'), str) else None

        # If the comment changes introducer/investor linkage, flag as fishy (needs explicit approval)
        if introducer_name and introducer_db and norm_text(introducer_name) != norm_text(introducer_db):
            fishy_rows.append({**row.to_dict(), 'fishy_reason': 'INTRODUCER_NAME_MISMATCH'})
            continue
        if investor_name and investor_db and norm_investor(investor_name) != norm_investor(investor_db):
            fishy_rows.append({**row.to_dict(), 'fishy_reason': 'INVESTOR_NAME_MISMATCH'})
            continue

        # build update set
        updates: Dict[str, Any] = {}
        if fee_type and fee_type != snapshot.basis_type:
            updates['basis_type'] = fee_type
        if rate_bps is not None and (snapshot.rate_bps is None or float(rate_bps) != float(snapshot.rate_bps)):
            updates['rate_bps'] = int(rate_bps)
        if amount is not None and (snapshot.accrual_amount is None or float(amount) != float(snapshot.accrual_amount)):
            updates['accrual_amount'] = amount
        if currency and currency != snapshot.currency:
            updates['currency'] = currency

        if not updates:
            continue

        set_clause = ', '.join([f"{col} = {sql_literal(val)}" for col, val in updates.items()])
        updates_sql.append(f"update introducer_commissions set {set_clause} where id = {sql_literal(commission_id)};")

    # add suggested duplicate deletes
    if DUP_DELETE_CSV.exists() and DUP_DELETE_CSV.stat().st_size:
        dup_df = pd.read_csv(DUP_DELETE_CSV)
        for _, row in dup_df.iterrows():
            ids = [x.strip() for x in str(row.get('candidate_ids', '')).split(',') if x.strip()]
            for _id in ids:
                deletes_sql.append(f"delete from introducer_commissions where id = {sql_literal(_id)};")

    # append unmatched rows as fishy
    if not unmatched.empty:
        for _, row in unmatched.iterrows():
            fishy_rows.append({**row.to_dict(), 'fishy_reason': row.get('match_reason')})

    OUT_UPDATES_SQL.write_text('\n'.join(updates_sql))
    OUT_DELETES_SQL.write_text('\n'.join(deletes_sql))

    if fishy_rows:
        fieldnames = sorted({key for row in fishy_rows for key in row.keys()})
        with OUT_FISHY.open('w', newline='') as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            for row in fishy_rows:
                writer.writerow(row)
    else:
        OUT_FISHY.write_text('')

    summary = [
        '# 05 commission comment SQL prep',
        f"- Updates prepared: {len(updates_sql)}",
        f"- Deletes prepared: {len(deletes_sql)}",
        f"- Fishy rows (skipped): {len(fishy_rows)}",
        '',
        'Outputs:',
        f"- {OUT_UPDATES_SQL}",
        f"- {OUT_DELETES_SQL}",
        f"- {OUT_FISHY}",
    ]
    OUT_SUMMARY.write_text('\n'.join(summary))


if __name__ == '__main__':
    main()
