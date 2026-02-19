from __future__ import annotations

import re
from datetime import datetime
from typing import Any


def to_float(v: Any) -> float:
    if v in (None, ""):
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace(",", "")
    if not s:
        return 0.0
    # Handle forms like "- ETH 11.25" where minus is separated from the number.
    neg_prefix = bool(re.match(r"^-\s*[A-Za-z$€£¥]*\s*\d", s))
    try:
        return float(s)
    except Exception:
        m = re.search(r"[-+]?\d*\.?\d+", s)
        if m:
            try:
                out = float(m.group(0))
                if neg_prefix and not m.group(0).startswith(("-", "+")):
                    out = -out
                return out
            except Exception:
                return 0.0
        return 0.0


def normalize_text(s: str) -> str:
    s = s.lower().strip()
    s = s.replace("&", " and ")
    s = s.replace("–", "-").replace("—", "-")
    s = re.sub(r"\b(mr|mrs|ms|dr|sir|madam|mme|m)\.?\b", " ", s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def canonical_name_key(s: str) -> str:
    n = normalize_text(s)
    parts = []
    for p in n.split(" "):
        if not p or p in {"and", "or"}:
            continue
        if len(p) > 4 and p.endswith("s"):
            p = p[:-1]
        parts.append(p)
    parts.sort()
    return "".join(parts)


def compact_name_key(s: str) -> str:
    n = normalize_text(s)
    toks = [t for t in n.split(" ") if t and t not in {"and", "or"}]
    return "".join(toks)


def loose_name_key(s: str) -> str:
    n = normalize_text(s)
    toks = [t for t in n.split(" ") if t and t not in {"and", "or"}]
    if not toks:
        return ""
    if len(toks) == 1:
        return toks[0]
    return toks[0] + toks[-1]


def alias_key_variants(s: str) -> set[str]:
    out = set()
    for v in (canonical_name_key(s), compact_name_key(s), loose_name_key(s)):
        if v:
            out.add(v)
    return out


def parse_date(v: Any) -> str | None:
    if v in (None, ""):
        return None
    if hasattr(v, "date"):
        try:
            return v.date().isoformat()
        except Exception:
            pass
    s = str(v).strip()
    if not s:
        return None
    if normalize_text(s) in {"isin", "check", "todo", "n a", "na"}:
        return None
    if not re.search(r"\d", s):
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except Exception:
            pass
    return None


def normalize_currency_token(v: Any) -> str:
    if v in (None, ""):
        return ""
    s = str(v).strip().upper()
    if not s:
        return ""
    symbol_map = {"$": "USD", "US$": "USD", "€": "EUR", "£": "GBP"}
    if s in symbol_map:
        return symbol_map[s]
    m = re.search(r"\b[A-Z]{3,5}\b", s)
    if m:
        return m.group(0)
    return ""
