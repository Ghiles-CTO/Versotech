"""Utility helpers for subscription migration ETL."""

from __future__ import annotations

import math
import re
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Optional


def clean_string(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def parse_decimal(value: Optional[str]) -> Optional[Decimal]:
    if value is None:
        return None
    text = str(value).strip().replace(",", "")
    if text in {"", "-", "--"}:
        return None
    try:
        return Decimal(text)
    except InvalidOperation:
        return None


def parse_float(value: Optional[str]) -> Optional[float]:
    dec = parse_decimal(value)
    return float(dec) if dec is not None else None


_ORDINAL_SUFFIX_RE = re.compile(r"(\d+)(st|nd|rd|th)")


def parse_date(value: Optional[str]) -> Optional[date]:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    # Excel serial numbers
    if text.replace(".", "", 1).isdigit():
        try:
            serial = float(text)
            if math.isfinite(serial):
                base = date(1899, 12, 30)
                return base + timedelta(days=int(serial))
        except Exception:
            pass
    text = text.replace(".", "/")
    for fmt in ("%m/%d/%Y", "%m/%d/%y", "%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    normalized = _ORDINAL_SUFFIX_RE.sub(r"\1", text)
    for fmt in ("%B %d %Y", "%b %d %Y", "%d %B %Y", "%d %b %Y"):
        try:
            return datetime.strptime(normalized, fmt).date()
        except ValueError:
            continue
    return None


_INVESTOR_KEY_RE = re.compile(r"[^A-Z0-9]")


def normalize_investor_key(display_name: Optional[str]) -> Optional[str]:
    if display_name is None:
        return None
    upper = display_name.upper()
    return _INVESTOR_KEY_RE.sub("", upper)


def bool_from_status(status: Optional[str]) -> Optional[bool]:
    if status is None:
        return None
    lowered = status.lower()
    if lowered in {"yes", "true", "y", "t", "1"}:
        return True
    if lowered in {"no", "false", "n", "f", "0"}:
        return False
    return None


__all__ = [
    "clean_string",
    "parse_decimal",
    "parse_float",
    "parse_date",
    "normalize_investor_key",
    "bool_from_status",
]
