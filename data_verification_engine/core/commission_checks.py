from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class FormulaCheckResult:
    ok: bool
    expected: float
    actual: float
    normalized_percent: float | None = None


def normalize_percent_to_fraction(percent_value: float) -> float:
    """
    Normalize percentage storage formats into a fraction.
    Example: 0.2 -> 0.2, 20 -> 0.2, 2.5 -> 0.025.
    """
    p = float(percent_value)
    if abs(p) >= 1.0:
        return p / 100.0
    return p


def check_amount_from_percent(base_amount: float, percent_value: float, amount_value: float, tol: float = 0.01) -> FormulaCheckResult:
    p = normalize_percent_to_fraction(percent_value)
    expected = float(base_amount) * p
    actual = float(amount_value)
    return FormulaCheckResult(ok=abs(expected - actual) <= tol, expected=expected, actual=actual, normalized_percent=p)


def check_amount_from_bps(base_amount: float, rate_bps: int | float, amount_value: float, tol: float = 0.01) -> FormulaCheckResult:
    rb = float(rate_bps)
    expected = float(base_amount) * (rb / 10000.0)
    actual = float(amount_value)
    return FormulaCheckResult(ok=abs(expected - actual) <= tol, expected=expected, actual=actual)


def looks_like_percent_copied_into_amount(percent_value: float, amount_value: float, minimum_base: float) -> bool:
    if abs(minimum_base) <= 1.0:
        return False
    return abs(float(percent_value) - float(amount_value)) <= 1e-9


def rate_bps_is_integer(v: Any) -> bool:
    if v in (None, ""):
        return True
    try:
        f = float(v)
    except Exception:
        return False
    return int(f) == f


def map_commission_basis_for_tier(basis_type: str, tier_number: int | None) -> str:
    """
    Normalize DB commission basis types so all engines can compare deterministically.
    DB uses `performance_fee` with `tier_number`; dashboard uses tier1/tier2 labels.
    """
    bt = (basis_type or "").strip()
    if bt != "performance_fee":
        return bt
    if tier_number == 1:
        return "performance_fee_tier1"
    if tier_number == 2:
        return "performance_fee_tier2"
    return "performance_fee"
