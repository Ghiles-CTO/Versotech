"""Subscription workbook migration ETL.

Usage:
    python -m subscription_migration.main \\
        --workbook docs/VERSO\\ DASHBOARD_V1.0.xlsx \\
        --config config/subscription_migration.json \
        --database-url $DATABASE_URL \
        [--dry-run]

The script stages spreadsheet data into helper tables, then (optionally)
loads/updates `vehicles`, `investors`, `subscriptions`, `entity_investors`,
and `investor_deal_holdings` using the rules described in
docs/subscription_data_migration_plan.md.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import sys
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import psycopg
from psycopg import sql
from psycopg.rows import dict_row

from .config import ETLConfig, VehicleConfig, _slugify_key
from .excel_reader import ExcelReader
from .utils import (
    clean_string,
    normalize_investor_key,
    parse_date,
    parse_decimal,
)

LOGGER = logging.getLogger("subscription_migration")


# ---------------------------------------------------------------------------
# Dataclasses representing workbook rows
# ---------------------------------------------------------------------------


@dataclass
class FxHint:
    from_currency: str
    to_currency: str
    rate: Optional[Decimal]
    source_note: Optional[str]


@dataclass
class SummaryRow:
    vehicle_code: str
    vehicle_name: Optional[str]
    stage: Optional[str]
    amount_invested: Optional[Decimal]
    total_fees: Optional[Decimal]
    fees_ratio: Optional[Decimal]
    currency: Optional[str]
    fx_rate: Optional[Decimal]
    fx_source: Optional[str]
    comments: Optional[str]
    source_sheet: str
    source_row: int
    raw_data: Dict[str, Optional[str]]


@dataclass
class SubscriptionLine:
    vehicle_code: str
    sheet_code: str
    investor_display_name: Optional[str]
    investor_entity: Optional[str]
    nominal_amount: Optional[Decimal]
    cash_amount: Optional[Decimal]
    fees_amount: Optional[Decimal]
    fee_percent: Optional[Decimal]
    amount_original: Optional[Decimal]
    currency_original: Optional[str]
    fx_rate: Optional[Decimal]
    amount_converted: Optional[Decimal]
    currency_converted: Optional[str]
    price_per_share: Optional[Decimal]
    ownership_percent: Optional[Decimal]
    order_date: Optional[str]
    trade_date: Optional[str]
    settlement_date: Optional[str]
    status_raw: Optional[str]
    status_mapped: Optional[str]
    isin: Optional[str]
    settlement_location: Optional[str]
    comments: Optional[str]
    notes: Optional[str]
    source_sheet: str
    source_row: int
    raw_data: Dict[str, Optional[str]]


@dataclass
class TrancheRow:
    vehicle_code: Optional[str]
    tranche_name: Optional[str]
    amount: Optional[Decimal]
    price_per_share: Optional[Decimal]
    comments: Optional[str]
    source_sheet: str
    source_row: int
    raw_data: Dict[str, Optional[str]]


@dataclass
class WorkbookData:
    summary_rows: List[SummaryRow]
    subscription_lines: List[SubscriptionLine]
    tranche_rows: List[TrancheRow]
    fx_hints: List[FxHint]


# ---------------------------------------------------------------------------
# Workbook parsing
# ---------------------------------------------------------------------------


class WorkbookParser:
    def __init__(self, config: ETLConfig):
        self.config = config

    def parse(self, workbook_path: str) -> WorkbookData:
        summary_rows: List[SummaryRow] = []
        subscription_lines: List[SubscriptionLine] = []
        tranches: List[TrancheRow] = []
        fx_hints: List[FxHint] = []

        reader = ExcelReader(workbook_path)
        with reader.open():
            summary_rows, fx_hints = self._parse_summary(reader)
            for sheet_name in reader.sheet_names():
                if sheet_name.startswith("VC"):
                    subscription_lines.extend(self._parse_vehicle_sheet(reader, sheet_name))
                elif sheet_name.upper().startswith("VEG"):
                    tranches.extend(self._parse_tranche_sheet(reader, sheet_name))
                # Additional sheets (JM, escrow) are staged as tranches for traceability
                elif sheet_name in {"JM", "2022 USD Escrow account", "2022 EUR Escrow account", "2022 GBP Escrow account", "2022 CHF Escrow account"}:
                    tranches.extend(self._parse_tranche_sheet(reader, sheet_name))

        return WorkbookData(summary_rows=summary_rows, subscription_lines=subscription_lines, tranche_rows=tranches, fx_hints=fx_hints)

    def _parse_summary(self, reader: ExcelReader) -> Tuple[List[SummaryRow], List[FxHint]]:
        summary_rows: List[SummaryRow] = []
        fx_hints: List[FxHint] = []
        header_detected = False
        headers: Dict[str, str] = {}

        for row_index, row in reader.iter_rows("Summary"):
            raw = {col: clean_string(val) for col, val in row.items()}
            vehicle_code = clean_string(row.get("B"))

            if not header_detected and vehicle_code and vehicle_code.lower() == "compartments":
                header_detected = True
                headers = {col: clean_string(val) or f"COL_{col}" for col, val in row.items()}
                continue

            fx_header = clean_string(row.get("P"))
            fx_rate = parse_decimal(row.get("Q"))
            fx_note = clean_string(row.get("R"))
            if not header_detected and fx_header and ">" in fx_header:
                from_currency, _, to_currency = fx_header.partition(">")
                fx_hints.append(
                    FxHint(
                        from_currency=from_currency.strip().upper(),
                        to_currency=to_currency.strip().upper(),
                        rate=fx_rate,
                        source_note=fx_note,
                    )
                )
                continue

            if header_detected and vehicle_code:
                amount_invested = parse_decimal(row.get("E"))
                total_fees = parse_decimal(row.get("F"))
                fees_ratio = parse_decimal(row.get("G"))
                vehicle_cfg = self.config.vehicles.get(vehicle_code.upper())
                summary_rows.append(
                    SummaryRow(
                        vehicle_code=vehicle_code.upper(),
                        vehicle_name=clean_string(row.get("C")),
                        stage=clean_string(row.get("D")),
                        amount_invested=amount_invested,
                        total_fees=total_fees,
                        fees_ratio=fees_ratio,
                        currency=vehicle_cfg.currency if vehicle_cfg else None,
                        fx_rate=Decimal(str(vehicle_cfg.fx_rate)) if vehicle_cfg and vehicle_cfg.fx_rate else None,
                        fx_source=vehicle_cfg.fx_rate_note
                        if vehicle_cfg and vehicle_cfg.fx_rate_note
                        else clean_string(row.get("P")),
                        comments=clean_string(row.get("Q")),
                        source_sheet="Summary",
                        source_row=row_index,
                        raw_data=raw,
                    )
                )

        return summary_rows, fx_hints

    def _parse_vehicle_sheet(self, reader: ExcelReader, sheet_name: str) -> List[SubscriptionLine]:
        vehicle_code = sheet_name.upper()
        lines: List[SubscriptionLine] = []
        headers: Dict[str, str] = {}
        header_detected = False
        header_meta: Dict[str, List[str] | Optional[str]] = {}
        vehicle_config: Optional[VehicleConfig] = self.config.vehicles.get(vehicle_code)

        def _match_first(header_map: Dict[str, str], keywords: Iterable[str], *, exclude: Iterable[str] = ()) -> Optional[str]:
            keywords_lower = [kw.lower() for kw in keywords]
            exclude_lower = [ex.lower() for ex in exclude]
            for col, title in header_map.items():
                title_lower = title.lower()
                if any(ex in title_lower for ex in exclude_lower):
                    continue
                if all(kw in title_lower for kw in keywords_lower):
                    return col
            return None

        def _match_all(header_map: Dict[str, str], keyword_sets: Iterable[Iterable[str]], *, exclude: Iterable[str] = ()) -> List[str]:
            seen: List[str] = []
            for keywords in keyword_sets:
                col = _match_first(header_map, keywords, exclude=exclude)
                if col and col not in seen:
                    seen.append(col)
            return seen

        def _first_nonempty(row: Dict[str, Optional[str]], columns: Iterable[str]) -> Optional[str]:
            for col in columns:
                value = row.get(col)
                if value is not None and clean_string(value) not in {None, "-", "--"}:
                    return value
            return None

        def _first_decimal(row: Dict[str, Optional[str]], columns: Iterable[str]) -> Optional[Decimal]:
            for col in columns:
                value = parse_decimal(row.get(col))
                if value is not None:
                    return value
            return None

        def _is_numeric_label(label: str) -> bool:
            if not label:
                return False
            stripped = "".join(ch for ch in label if ch not in {" ", "\t", "\n", "\r"})
            if not stripped:
                return False
            try:
                Decimal(stripped)
                return True
            except InvalidOperation:
                return False

        for row_index, row in reader.iter_rows(sheet_name):
            raw = {col: clean_string(val) for col, val in row.items()}
            if not header_detected:
                header_detected = any(
                    clean_string(value)
                    and clean_string(value).lower()
                    in {"counterparty", "investor", "opportunity", "tranches", "index"}
                    for value in row.values()
                )
                if header_detected:
                    headers = {col: clean_string(val) or f"COL_{col}" for col, val in row.items()}
                    header_meta = {}
                    # Investor display columns
                    display_cols = _match_all(
                        headers,
                        [
                            ("counterparty",),
                            ("investor", "name"),
                            ("investor", "first"),
                            ("investor", "last"),
                            ("names",),
                        ],
                    )
                    if not display_cols:
                        display_cols = _match_all(headers, [("opportunity",)])
                    header_meta["display_cols"] = display_cols
                    # Investor entity column
                    header_meta["entity_col"] = _match_first(headers, ("entity",))
                    # Opportunity column (fallback display)
                    header_meta["opportunity_col"] = _match_first(headers, ("opportunity",))
                    # Index column for skipping totals
                    header_meta["index_col"] = _match_first(headers, ("index",))
                    # Vehicle column
                    header_meta["vehicle_col"] = _match_first(headers, ("vehicle",))
                    # Nominal/original amount columns
                    header_meta["nominal_cols"] = _match_all(
                        headers,
                        [
                            ("nominal",),
                            ("amount", "invested"),
                            ("investment", "amount"),
                            ("principal",),
                        ],
                    )
                    # Cash/converted amount columns
                    header_meta["amount_cols"] = _match_all(
                        headers,
                        [
                            ("amount",),
                            ("cash",),
                            ("drawn",),
                        ],
                        exclude=("invested",),
                    )
                    # Price per share / PPS
                    header_meta["price_cols"] = _match_all(
                        headers,
                        [
                            ("price per share",),
                            ("note price",),
                            ("pps",),
                            ("cost per share",),
                        ],
                    )
                    # Ownership percent
                    header_meta["ownership_cols"] = _match_all(
                        headers,
                        [
                            ("ownership",),
                            ("position",),
                            ("% holdings",),
                        ],
                    )
                    # Fee percent and amount
                    header_meta["fee_percent_cols"] = _match_all(
                        headers,
                        [
                            ("fees", "%"),
                            ("fee", "%"),
                            ("subscription fees", "%"),
                        ],
                    )
                    header_meta["fee_amount_cols"] = _match_all(
                        headers,
                        [
                            ("fees",),
                            ("subscription fees",),
                        ],
                        exclude=("%",),
                    )
                    # Date columns
                    header_meta["order_date_cols"] = _match_all(
                        headers,
                        [
                            ("order date",),
                            ("contract date",),
                            ("order",),
                        ],
                    )
                    header_meta["trade_date_cols"] = _match_all(
                        headers,
                        [
                            ("trade date",),
                            ("td",),
                        ],
                    )
                    header_meta["settlement_date_cols"] = _match_all(
                        headers,
                        [
                            ("settlement date",),
                            ("sd",),
                        ],
                    )
                    # Status column
                    header_meta["status_cols"] = _match_all(
                        headers,
                        [
                            ("trade status",),
                            ("status",),
                        ]
                    )
                    # ISIN and settlement location
                    header_meta["isin_col"] = _match_first(headers, ("isin",))
                    header_meta["settlement_col"] = _match_first(headers, ("settlement",))
                    # Comments and notes
                    header_meta["comments_cols"] = _match_all(
                        headers,
                        [
                            ("comments",),
                        ],
                    )
                    header_meta["notes_cols"] = _match_all(
                        headers,
                        [
                            ("to do",),
                            ("notes",),
                        ],
                    )
                continue

            if not headers:
                continue

            investor_display = None
            display_parts: List[str] = []
            for col in header_meta.get("display_cols", []):
                value = clean_string(row.get(col))
                if value:
                    display_parts.append(value)
            if display_parts:
                investor_display = " ".join(dict.fromkeys(display_parts))

            investor_entity = clean_string(_first_nonempty(row, [header_meta.get("entity_col")] if header_meta.get("entity_col") else []))
            if not investor_display:
                investor_display = investor_entity
            if not investor_display:
                opportunity_col = header_meta.get("opportunity_col")
                if opportunity_col:
                    investor_display = clean_string(row.get(opportunity_col))
            if investor_display is None:
                continue

            index_value = clean_string(row.get(header_meta.get("index_col"))) if header_meta.get("index_col") else None
            if investor_display and investor_display.lower() in {"total", "subtotal"}:
                continue
            if index_value and index_value.lower() in {"total", "subtotal"}:
                continue
            if investor_display and _is_numeric_label(investor_display):
                continue

            vehicle_col = header_meta.get("vehicle_col")
            row_vehicle_code = clean_string(row.get(vehicle_col)) if vehicle_col else None
            if vehicle_config and vehicle_config.force_sheet_vehicle_code:
                row_vehicle_code = vehicle_code
            row_vehicle_code = row_vehicle_code or vehicle_code

            nominal = _first_decimal(row, header_meta.get("nominal_cols", []))
            amount_converted = _first_decimal(row, header_meta.get("amount_cols", []))
            if amount_converted is None:
                amount_converted = nominal
            if nominal is None and amount_converted is None:
                continue

            fee_percent = _first_decimal(row, header_meta.get("fee_percent_cols", []))
            fees_amount = _first_decimal(row, header_meta.get("fee_amount_cols", []))
            price_per_share = _first_decimal(row, header_meta.get("price_cols", []))
            ownership_percent = _first_decimal(row, header_meta.get("ownership_cols", []))
            order_date = self._format_date(_first_nonempty(row, header_meta.get("order_date_cols", [])))
            trade_date = self._format_date(_first_nonempty(row, header_meta.get("trade_date_cols", [])))
            settlement_date = self._format_date(_first_nonempty(row, header_meta.get("settlement_date_cols", [])))
            status_raw = clean_string(_first_nonempty(row, header_meta.get("status_cols", [])))
            status_mapped = self._map_status(status_raw)

            currency_original = vehicle_config.currency if vehicle_config else None
            target_currency = (
                vehicle_config.target_currency or self.config.default_target_currency
            ) if vehicle_config else self.config.default_target_currency
            fx_rate = Decimal(str(vehicle_config.fx_rate)) if vehicle_config and vehicle_config.fx_rate else None
            if fx_rate is None and currency_original and currency_original.upper() != target_currency.upper():
                fx = self.config.fx_rates.get(currency_original.upper())
                if fx:
                    fx_rate = Decimal(str(fx.rate))
                    target_currency = fx.to_currency

            amount_original = nominal
            converted_amount = amount_converted
            if converted_amount is not None and fx_rate is None:
                # If amount appears already converted (e.g. USD), keep currency.
                converted = converted_amount
            elif amount_original is not None and fx_rate is not None:
                converted = (amount_original * fx_rate).quantize(Decimal("0.01"))
            else:
                converted = converted_amount
            currency_converted = target_currency if converted is not None else currency_original or target_currency

            comments_parts = [
                clean_string(row.get(col))
                for col in header_meta.get("comments_cols", [])
                if clean_string(row.get(col))
            ]
            comments = "; ".join(dict.fromkeys(comments_parts)) if comments_parts else None
            notes_parts = [
                clean_string(row.get(col))
                for col in header_meta.get("notes_cols", [])
                if clean_string(row.get(col))
            ]
            notes = "; ".join(dict.fromkeys(notes_parts)) if notes_parts else None

            lines.append(
                SubscriptionLine(
                    vehicle_code=row_vehicle_code.upper(),
                    sheet_code=sheet_name,
                    investor_display_name=investor_display,
                    investor_entity=investor_entity if investor_entity not in {None, row_vehicle_code} else investor_display,
                    nominal_amount=amount_original,
                    cash_amount=amount_converted if amount_converted is not None else converted,
                    fees_amount=fees_amount,
                    fee_percent=fee_percent,
                    amount_original=amount_original,
                    currency_original=currency_original,
                    fx_rate=fx_rate,
                    amount_converted=converted,
                    currency_converted=currency_converted,
                    price_per_share=price_per_share,
                    ownership_percent=ownership_percent,
                    order_date=order_date,
                    trade_date=trade_date,
                    settlement_date=settlement_date,
                    status_raw=status_raw,
                    status_mapped=status_mapped,
                    isin=clean_string(row.get(header_meta.get("isin_col"))) if header_meta.get("isin_col") else None,
                    settlement_location=clean_string(row.get(header_meta.get("settlement_col"))) if header_meta.get("settlement_col") else None,
                    comments=comments,
                    notes=notes,
                    source_sheet=sheet_name,
                    source_row=row_index,
                    raw_data=raw,
                )
            )
        return lines

    def _parse_tranche_sheet(self, reader: ExcelReader, sheet_name: str) -> List[TrancheRow]:
        vehicle_code = None
        if sheet_name.startswith("VC"):
            vehicle_code = sheet_name.upper()

        rows: List[TrancheRow] = []
        header_seen = False
        for row_index, row in reader.iter_rows(sheet_name):
            raw = {col: clean_string(val) for col, val in row.items()}
            tranche_name = clean_string(row.get("B"))
            amount = parse_decimal(row.get("F"))

            if not header_seen:
                header_seen = bool(tranche_name and tranche_name.lower() in {"tranches", "index"})
                continue

            if not tranche_name and amount is None:
                continue

            rows.append(
                TrancheRow(
                    vehicle_code=vehicle_code,
                    tranche_name=tranche_name,
                    amount=amount,
                    price_per_share=parse_decimal(row.get("D")),
                    comments=clean_string(row.get("H")),
                    source_sheet=sheet_name,
                    source_row=row_index,
                    raw_data=raw,
                )
            )
        return rows

    def _map_status(self, raw_status: Optional[str]) -> Optional[str]:
        if raw_status is None:
            return None
        normalized = raw_status.lower()
        return self.config.status_mapping.get(normalized, normalized)

    @staticmethod
    def _format_date(value: Optional[str]) -> Optional[str]:
        parsed = parse_date(value)
        return parsed.isoformat() if parsed else None


# ---------------------------------------------------------------------------
# Database access helpers
# ---------------------------------------------------------------------------


class Database:
    def __init__(self, dsn: str):
        self.conn = psycopg.connect(dsn, autocommit=False)
        self.conn.row_factory = dict_row

    def close(self) -> None:
        self.conn.close()

    def insert_run(self, *, source_filename: str, source_hash: str, dry_run: bool, executed_by: Optional[str]) -> str:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into public.subscription_workbook_runs (source_filename, source_hash, dry_run, executed_by)
                values (%s, %s, %s, %s)
                returning id
                """,
                (source_filename, source_hash, dry_run, executed_by),
            )
            row = cur.fetchone()
            return row["id"]

    def update_run_state(self, run_id: str, state: str, notes: Optional[str] = None) -> None:
        with self.conn.cursor() as cur:
            if notes:
                cur.execute(
                    """
                    update public.subscription_workbook_runs
                       set run_state = %s,
                           notes = coalesce(notes, '') || E'\\n' || %s
                     where id = %s
                    """,
                    (state, notes, run_id),
                )
            else:
                cur.execute(
                    """
                    update public.subscription_workbook_runs
                       set run_state = %s
                     where id = %s
                    """,
                    (state, run_id),
                )

    def stage_summary(self, run_id: str, rows: Iterable[SummaryRow]) -> None:
        if not rows:
            return
        records = [
            (
                run_id,
                row.vehicle_code,
                row.vehicle_name,
                row.stage,
                row.currency,
                row.fx_rate,
                row.amount_invested,
                row.total_fees,
                row.fx_source,
                row.comments,
                row.source_sheet,
                row.source_row,
                json.dumps(row.raw_data),
            )
            for row in rows
        ]
        with self.conn.cursor() as cur:
            cur.executemany(
                """
                insert into public.stg_subscription_summary (
                    run_id,
                    vehicle_code,
                    vehicle_name,
                    stage,
                    currency,
                    fx_rate,
                    amount_invested,
                    total_fees,
                    fx_source,
                    comments,
                    source_sheet,
                    source_row,
                    raw_data
                ) values (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                records,
            )

    def stage_subscription_lines(self, run_id: str, lines: Iterable[SubscriptionLine]) -> None:
        if not lines:
            return
        records = [
            (
                run_id,
                line.vehicle_code,
                line.sheet_code,
                line.investor_display_name and _first_name(line.investor_display_name),
                line.investor_display_name and _last_name(line.investor_display_name),
                line.investor_entity,
                line.investor_display_name,
                line.nominal_amount,
                line.cash_amount,
                line.fees_amount,
                line.fee_percent,
                line.amount_original,
                line.currency_original,
                line.fx_rate,
                line.amount_converted,
                line.currency_converted,
                line.price_per_share,
                line.ownership_percent,
                line.order_date,
                line.trade_date,
                line.settlement_date,
                line.status_raw,
                line.status_mapped,
                line.isin,
                line.settlement_location,
                line.comments,
                line.notes,
                line.source_sheet,
                line.source_row,
                json.dumps(line.raw_data),
            )
            for line in lines
        ]
        with self.conn.cursor() as cur:
            cur.executemany(
                """
                insert into public.stg_subscription_lines (
                  run_id,
                  vehicle_code,
                  sheet_code,
                  investor_first_name,
                  investor_last_name,
                  investor_entity,
                  investor_display_name,
                  nominal_amount,
                  cash_amount,
                  fees_amount,
                  fee_percent,
                  amount_original,
                  currency_original,
                  fx_rate,
                  amount_converted,
                  currency_converted,
                  price_per_share,
                  ownership_percent,
                  order_date,
                  trade_date,
                  settlement_date,
                  status_raw,
                  status_mapped,
                  isin,
                  settlement_location,
                  comments,
                  notes,
                  source_sheet,
                  source_row,
                  raw_data
                ) values (
                  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                records,
            )

    def stage_tranches(self, run_id: str, rows: Iterable[TrancheRow]) -> None:
        if not rows:
            return
        records = [
            (
                run_id,
                row.vehicle_code,
                row.tranche_name,
                row.amount,
                row.price_per_share,
                row.comments,
                row.source_sheet,
                row.source_row,
                json.dumps(row.raw_data),
            )
            for row in rows
        ]
        with self.conn.cursor() as cur:
            cur.executemany(
                """
                insert into public.stg_subscription_tranches (
                  run_id,
                  vehicle_code,
                  tranche_name,
                  amount,
                  price_per_share,
                  comments,
                  source_sheet,
                  source_row,
                  raw_data
                ) values (
                  %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                records,
            )

    def commit(self) -> None:
        self.conn.commit()

    def rollback(self) -> None:
        self.conn.rollback()

    # Query helpers for load phase -----------------------------------------

    def fetch_vehicle_by_code(self, vehicle_code: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select * from public.vehicles
                 where upper(name) = %s
                 order by created_at asc
                 limit 1
                """,
                (vehicle_code.upper(),),
            )
            return cur.fetchone()

    def fetch_vehicle_by_name(self, name: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select * from public.vehicles
                 where upper(name) = %s
                 order by created_at asc
                 limit 1
                """,
                (name.upper(),),
            )
            return cur.fetchone()

    def fetch_vehicle_by_investment_name(self, investment_name: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select * from public.vehicles
                 where upper(investment_name) = %s
                 order by created_at asc
                 limit 1
                """,
                (investment_name.upper(),),
            )
            return cur.fetchone()

    def fetch_vehicle_by_id(self, vehicle_id: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select * from public.vehicles
                 where id = %s
                 limit 1
                """,
                (vehicle_id,),
            )
            return cur.fetchone()

    def create_vehicle(self, cfg: VehicleConfig) -> Dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into public.vehicles (name, domicile, currency, type, notes)
                values (%s, %s, coalesce(%s, 'USD'), %s, %s)
                returning *
                """,
                (
                    cfg.name,
                    cfg.domicile,
                    cfg.currency or cfg.target_currency or "USD",
                    cfg.vehicle_type or "other",
                    cfg.notes,
                ),
            )
            return cur.fetchone()

    def fetch_investor(self, name: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select * from public.investors
                 where upper(legal_name) = %s
                    or upper(display_name) = %s
                 order by created_at asc
                 limit 1
                """,
                (name.upper(), name.upper()),
            )
            return cur.fetchone()

    def create_investor(self, override: "InvestorStub") -> Dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into public.investors (legal_name, display_name, type, email, country)
                values (%s, %s, %s, %s, %s)
                returning *
                """,
                (
                    override.legal_name,
                    override.display_name or override.legal_name,
                    override.investor_type or "entity",
                    override.email,
                    override.country,
                ),
            )
            return cur.fetchone()

    def upsert_subscription(self, payload: Dict) -> Dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                select *
                  from public.subscriptions
                 where investor_id = %(investor_id)s
                   and vehicle_id = %(vehicle_id)s
                 order by created_at asc
                 limit 1
                """,
                payload,
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    """
                    update public.subscriptions
                       set commitment = %(commitment)s,
                           currency = %(currency)s,
                           status = %(status)s,
                           committed_at = coalesce(%(committed_at)s, committed_at),
                           effective_date = coalesce(%(effective_date)s, effective_date),
                           funding_due_at = coalesce(%(funding_due_at)s, funding_due_at),
                           acknowledgement_notes = %(acknowledgement_notes)s
                     where id = %(id)s
                     returning *
                    """,
                    {
                        **payload,
                        "id": existing["id"],
                    },
                )
                return cur.fetchone()
            cur.execute(
                """
                insert into public.subscriptions (
                    investor_id,
                    vehicle_id,
                    commitment,
                    currency,
                    status,
                    committed_at,
                    effective_date,
                    funding_due_at,
                    acknowledgement_notes
                )
                values (%(investor_id)s, %(vehicle_id)s, %(commitment)s, %(currency)s, %(status)s,
                        %(committed_at)s, %(effective_date)s, %(funding_due_at)s, %(acknowledgement_notes)s)
                returning *
                """,
                payload,
            )
            return cur.fetchone()

    def upsert_entity_investor(self, payload: Dict) -> Dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into public.entity_investors (
                  vehicle_id,
                  investor_id,
                  subscription_id,
                  relationship_role,
                  allocation_status,
                  notes
                )
                values (%(vehicle_id)s, %(investor_id)s, %(subscription_id)s, %(relationship_role)s, %(allocation_status)s, %(notes)s)
                on conflict (vehicle_id, investor_id)
                do update set
                  subscription_id = excluded.subscription_id,
                  allocation_status = excluded.allocation_status,
                  notes = excluded.notes
                returning *
                """,
                payload,
            )
            return cur.fetchone()

    def upsert_investor_deal_holding(self, payload: Dict) -> Dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into investor_deal_holdings (
                  investor_id,
                  deal_id,
                  status,
                  subscribed_amount,
                  currency,
                  effective_date,
                  funding_due_at,
                  funded_at
                )
                values (%(investor_id)s, %(deal_id)s, %(status)s, %(subscribed_amount)s, %(currency)s,
                        %(effective_date)s, %(funding_due_at)s, %(funded_at)s)
                on conflict (investor_id, deal_id)
                do update set
                  status = excluded.status,
                  subscribed_amount = excluded.subscribed_amount,
                  currency = excluded.currency,
                  effective_date = coalesce(excluded.effective_date, investor_deal_holdings.effective_date),
                  funding_due_at = coalesce(excluded.funding_due_at, investor_deal_holdings.funding_due_at),
                  funded_at = coalesce(excluded.funded_at, investor_deal_holdings.funded_at)
                returning *
                """,
                payload,
            )
            return cur.fetchone()

    def insert_import_log(self, payload: Dict) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                insert into public.subscription_import_results (
                  run_id,
                  subscription_id,
                  entity_investor_id,
                  investor_deal_holding_id,
                  investor_id,
                  vehicle_id
                )
                values (%(run_id)s, %(subscription_id)s, %(entity_investor_id)s, %(investor_deal_holding_id)s, %(investor_id)s, %(vehicle_id)s)
                """,
                payload,
            )


@dataclass
class InvestorStub:
    legal_name: str
    display_name: Optional[str]
    investor_type: Optional[str]
    email: Optional[str]
    country: Optional[str]


# ---------------------------------------------------------------------------
# Load / normalization logic
# ---------------------------------------------------------------------------


class Loader:
    def __init__(self, db: Database, config: ETLConfig, run_id: str):
        self.db = db
        self.config = config
        self.run_id = run_id
        self.vehicle_cache: Dict[str, Dict] = {}
        self.investor_cache: Dict[str, Dict] = {}

    def resolve_vehicle(self, vehicle_code: str, summary_row: Optional[SummaryRow]) -> Dict:
        code = vehicle_code.upper()
        if code in self.vehicle_cache:
            return self.vehicle_cache[code]

        cfg = self.config.vehicles.get(code)
        if cfg and cfg.skip:
            raise RuntimeError(f"Vehicle code {code} is configured to skip; update mapping before import.")
        vehicle: Optional[Dict] = None
        if cfg and cfg.vehicle_id:
            vehicle = self.db.fetch_vehicle_by_id(cfg.vehicle_id)
            if not vehicle:
                raise RuntimeError(f"Configured vehicle_id {cfg.vehicle_id} for {code} not found in public.vehicles")

        if vehicle is None and summary_row and summary_row.vehicle_name:
            name = summary_row.vehicle_name
            vehicle = self.db.fetch_vehicle_by_investment_name(name)
            if vehicle is None:
                vehicle = self.db.fetch_vehicle_by_name(name)

        if vehicle is None and cfg:
            if cfg.name:
                vehicle = self.db.fetch_vehicle_by_name(cfg.name)
            if vehicle is None and cfg.notes:
                hint = clean_string(cfg.notes)
                if hint:
                    vehicle = self.db.fetch_vehicle_by_investment_name(hint) or self.db.fetch_vehicle_by_name(hint)

        if vehicle is None:
            raise RuntimeError(f"Could not resolve vehicle for code {code}. Update configuration.")

        self.vehicle_cache[code] = vehicle
        return vehicle

    def resolve_investor(self, investor_name: str) -> Dict:
        key = normalize_investor_key(investor_name)
        if not key:
            raise RuntimeError(f"Cannot resolve investor for blank name '{investor_name}'")
        if key in self.investor_cache:
            return self.investor_cache[key]

        override = self.config.investor_overrides.get(key)
        # Check for default override if specific one not found
        if not override:
            override = self.config.investor_overrides.get("DEFAULT")
        investor: Optional[Dict] = None
        if override and override.investor_id:
            with self.db.conn.cursor() as cur:
                cur.execute("select * from public.investors where id = %s", (override.investor_id,))
                investor = cur.fetchone()
                if not investor:
                    LOGGER.warning("Configured investor_id %s for %s not found", override.investor_id, investor_name)

        if investor is None:
            investor = self.db.fetch_investor(investor_name)

        if investor is None and override and override.create_if_missing:
            stub = InvestorStub(
                legal_name=override.legal_name if override.key != "DEFAULT" or override.legal_name else investor_name,
                display_name=override.display_name or investor_name,
                investor_type=override.investor_type,
                email=override.email,
                country=override.country,
            )
            LOGGER.info("Creating investor %s", stub.legal_name)
            investor = self.db.create_investor(stub)

        if investor is None:
            raise RuntimeError(f"Could not resolve investor '{investor_name}'. Add mapping to config.")

        self.investor_cache[key] = investor
        return investor

    def load_subscriptions(self, aggregated: Iterable["AggregatedSubscription"]) -> None:
        status_priority = ["active", "committed", "pending", "closed", "cancelled"]
        priority_index = {status: idx for idx, status in enumerate(status_priority)}
        for agg in aggregated:
            cfg = self.config.vehicles.get(agg.vehicle_code.upper())
            if cfg and cfg.skip:
                LOGGER.info("Skipping vehicle %s (configured to skip)", agg.vehicle_code.upper())
                continue
            vehicle = self.resolve_vehicle(agg.vehicle_code, agg.summary_row)
            investor = self.resolve_investor(agg.investor_display_name)

            chosen_status = sorted(agg.statuses, key=lambda s: priority_index.get(s, len(status_priority)))[0]

            payload = {
                "investor_id": investor["id"],
                "vehicle_id": vehicle["id"],
                "commitment": agg.total_amount,
                "currency": agg.currency or self.config.default_target_currency,
                "status": chosen_status,
                "committed_at": agg.effective_date,
                "effective_date": agg.effective_date,
                "funding_due_at": agg.funding_due_at,
                "acknowledgement_notes": json.dumps(agg.build_notes_payload(str(self.run_id))),
            }
            subscription = self.db.upsert_subscription(payload)

            allocation_status = self.config.allocation_mapping.get(chosen_status, chosen_status)
            entity_payload = {
                "vehicle_id": vehicle["id"],
                "investor_id": investor["id"],
                "subscription_id": subscription["id"],
                "relationship_role": "investor",
                "allocation_status": allocation_status,
                "notes": f"Imported via workbook run {self.run_id}",
            }
            entity = self.db.upsert_entity_investor(entity_payload)

            holding = None
            vehicle_cfg = self.config.vehicles.get(agg.vehicle_code.upper())
            if vehicle_cfg and vehicle_cfg.deal_id:
                holding_status = "funded" if chosen_status in {"active", "closed"} else "pending_funding"
                holding_payload = {
                    "investor_id": investor["id"],
                    "deal_id": vehicle_cfg.deal_id,
                    "status": holding_status,
                    "subscribed_amount": agg.total_amount,
                    "currency": agg.currency or self.config.default_target_currency,
                    "effective_date": agg.effective_date,
                    "funding_due_at": agg.funding_due_at,
                    "funded_at": agg.effective_date if holding_status == "funded" else None,
                }
                holding = self.db.upsert_investor_deal_holding(holding_payload)

            self.db.insert_import_log(
                {
                    "run_id": self.run_id,
                    "subscription_id": subscription["id"],
                    "entity_investor_id": entity["id"],
                    "investor_deal_holding_id": holding["id"] if holding else None,
                    "investor_id": investor["id"],
                    "vehicle_id": vehicle["id"],
                }
            )


@dataclass
class AggregatedSubscription:
    vehicle_code: str
    investor_display_name: str
    lines: List[SubscriptionLine]
    summary_row: Optional[SummaryRow]
    total_amount: Decimal
    currency: Optional[str]
    effective_date: Optional[str]
    funding_due_at: Optional[str]
    statuses: List[str]

    def build_notes_payload(self, run_id: str) -> Dict:
        return {
            "source": "legacy_workbook",
            "run_id": run_id,
            "line_items": [
                {
                    "sheet": line.source_sheet,
                    "row": line.source_row,
                    "amount_original": _decimal_to_str(line.amount_original),
                    "amount_converted": _decimal_to_str(line.amount_converted),
                    "currency_original": line.currency_original,
                    "currency_converted": line.currency_converted,
                    "status": line.status_mapped or line.status_raw,
                    "order_date": line.order_date,
                    "settlement_date": line.settlement_date,
                    "comments": line.comments,
                }
                for line in self.lines
            ],
        }


def aggregate_lines(
    lines: Iterable[SubscriptionLine], summary_lookup: Dict[str, SummaryRow], default_currency: str
) -> List[AggregatedSubscription]:
    grouped: Dict[Tuple[str, str], List[SubscriptionLine]] = {}
    for line in lines:
        if not line.investor_display_name:
            LOGGER.warning(
                "Skipping row without investor name: %s row %s", line.source_sheet, line.source_row
            )
            continue
        key = (line.vehicle_code.upper(), line.investor_display_name.strip())
        grouped.setdefault(key, []).append(line)

    aggregated: List[AggregatedSubscription] = []
    for (vehicle_code, investor_name), group_lines in grouped.items():
        amounts = [line.amount_converted or line.amount_original or Decimal("0") for line in group_lines]
        total_amount = sum((amount for amount in amounts if amount is not None), Decimal("0"))
        earliest_order = min((line.order_date for line in group_lines if line.order_date), default=None)
        latest_settlement = max((line.settlement_date for line in group_lines if line.settlement_date), default=None)
        statuses = [
            (line.status_mapped or line.status_raw or "pending").lower()
            for line in group_lines
        ]
        currency = None
        for line in group_lines:
            if line.currency_converted:
                currency = line.currency_converted
                break
        if currency is None:
            currency = default_currency
        total_amount = total_amount.quantize(Decimal("0.01")) if total_amount is not None else Decimal("0.00")
        aggregated.append(
            AggregatedSubscription(
                vehicle_code=vehicle_code,
                investor_display_name=investor_name,
                lines=group_lines,
                summary_row=summary_lookup.get(vehicle_code),
                total_amount=total_amount,
                currency=currency,
                effective_date=earliest_order or latest_settlement,
                funding_due_at=latest_settlement,
                statuses=statuses,
            )
        )

    return aggregated


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def _first_name(display_name: str) -> Optional[str]:
    parts = display_name.split()
    return parts[0] if parts else None


def _last_name(display_name: str) -> Optional[str]:
    parts = display_name.split()
    if len(parts) >= 2:
        return parts[-1]
    return None


def _decimal_to_str(value: Optional[Decimal]) -> Optional[str]:
    if value is None:
        return None
    return str(value)


def compute_file_hash(path: str) -> str:
    h = hashlib.md5()
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Legacy subscription workbook migration ETL")
    parser.add_argument("--workbook", required=True, help="Path to the legacy Excel workbook")
    parser.add_argument("--config", required=True, help="Path to JSON config file for mappings")
    parser.add_argument("--database-url", required=True, help="Postgres connection string")
    parser.add_argument("--executed-by", help="Freeform string recorded with the run")
    parser.add_argument("--dry-run", action="store_true", help="Stage data only, skip final load")
    parser.add_argument("--log-level", default="INFO", help="Logging level (DEBUG, INFO, WARNING, ERROR)")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(stream=sys.stdout, level=getattr(logging, args.log_level.upper(), logging.INFO))

    workbook_path = Path(args.workbook)
    if not workbook_path.exists():
        LOGGER.error("Workbook %s not found", workbook_path)
        return 1

    config = ETLConfig.load(args.config)
    parser = WorkbookParser(config)
    workbook_data = parser.parse(str(workbook_path))

    LOGGER.info(
        "Parsed workbook: %s summary rows, %s subscription lines, %s tranches",
        len(workbook_data.summary_rows),
        len(workbook_data.subscription_lines),
        len(workbook_data.tranche_rows),
    )

    file_hash = compute_file_hash(str(workbook_path))
    LOGGER.info("Workbook MD5: %s", file_hash)

    db = Database(args.database_url)
    try:
        run_id = db.insert_run(
            source_filename=str(workbook_path.name),
            source_hash=file_hash,
            dry_run=args.dry_run,
            executed_by=args.executed_by,
        )
        LOGGER.info("Created staging run %s", run_id)

        db.stage_summary(run_id, workbook_data.summary_rows)
        db.stage_subscription_lines(run_id, workbook_data.subscription_lines)
        db.stage_tranches(run_id, workbook_data.tranche_rows)

        if args.dry_run:
            db.update_run_state(run_id, "loaded", notes="Dry run - staging only.")
            db.commit()
            LOGGER.info("Dry run completed; data staged only.")
            return 0

        summary_lookup = {row.vehicle_code: row for row in workbook_data.summary_rows}
        aggregated = aggregate_lines(workbook_data.subscription_lines, summary_lookup, config.default_target_currency)
        LOGGER.info("Aggregated into %s subscription payloads", len(aggregated))

        loader = Loader(db, config, run_id)
        loader.load_subscriptions(aggregated)

        db.update_run_state(run_id, "loaded")
        db.commit()
        LOGGER.info("Migration run %s completed successfully.", run_id)
        return 0
    except Exception:  # noqa: BLE001
        LOGGER.exception("Migration run failed; rolling back.")
        db.rollback()
        if "run_id" in locals():
            db.update_run_state(run_id, "failed", notes="Run failed; transaction rolled back.")
            db.commit()
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
