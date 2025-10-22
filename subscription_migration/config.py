"""Configuration loading for the subscription migration ETL."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Optional


def _slugify_key(value: str) -> str:
    return "".join(ch for ch in value.upper() if ch.isalnum())


@dataclass
class FxRate:
    from_currency: str
    to_currency: str
    rate: float
    as_of: Optional[str] = None
    note: Optional[str] = None


@dataclass
class VehicleConfig:
    code: str
    name: Optional[str] = None
    vehicle_id: Optional[str] = None
    currency: Optional[str] = None
    target_currency: Optional[str] = None
    fx_rate: Optional[float] = None
    fx_rate_note: Optional[str] = None
    vehicle_type: Optional[str] = None
    domicile: Optional[str] = None
    create_if_missing: bool = False
    notes: Optional[str] = None
    deal_id: Optional[str] = None


@dataclass
class InvestorOverride:
    key: str
    investor_id: Optional[str] = None
    legal_name: Optional[str] = None
    display_name: Optional[str] = None
    investor_type: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    create_if_missing: bool = False


@dataclass
class ETLConfig:
    default_target_currency: str = "USD"
    status_mapping: Dict[str, str] = field(default_factory=dict)
    allocation_mapping: Dict[str, str] = field(default_factory=dict)
    fx_rates: Dict[str, FxRate] = field(default_factory=dict)
    vehicles: Dict[str, VehicleConfig] = field(default_factory=dict)
    investor_overrides: Dict[str, InvestorOverride] = field(default_factory=dict)

    @classmethod
    def load(cls, path: str | Path) -> "ETLConfig":
        data = json.loads(Path(path).read_text())
        status_mapping = {k.lower(): v.lower() for k, v in data.get("status_mapping", {}).items()}
        allocation_mapping = {k.lower(): v for k, v in data.get("allocation_mapping", {}).items()}
        fx_rates = {
            key.upper(): FxRate(
                from_currency=val.get("from", key.upper()),
                to_currency=val.get("to", data.get("default_target_currency", "USD")),
                rate=float(val["rate"]),
                as_of=val.get("as_of"),
                note=val.get("note"),
            )
            for key, val in data.get("fx_rates", {}).items()
            if "rate" in val
        }
        vehicles = {
            code.upper(): VehicleConfig(
                code=code.upper(),
                name=info.get("name"),
                vehicle_id=info.get("vehicle_id"),
                currency=info.get("currency"),
                target_currency=info.get("target_currency"),
                fx_rate=info.get("fx_rate"),
                fx_rate_note=info.get("fx_rate_note"),
                vehicle_type=info.get("type"),
                domicile=info.get("domicile"),
                create_if_missing=bool(info.get("create_if_missing", False)),
                notes=info.get("notes"),
                deal_id=info.get("deal_id"),
            )
            for code, info in data.get("vehicles", {}).items()
        }
        investor_overrides = {
            _slugify_key(key): InvestorOverride(
                key=_slugify_key(key),
                investor_id=info.get("investor_id"),
                legal_name=info.get("legal_name") or key,
                display_name=info.get("display_name"),
                investor_type=info.get("type"),
                email=info.get("email"),
                country=info.get("country"),
                create_if_missing=bool(info.get("create_if_missing", False)),
            )
            for key, info in data.get("investor_overrides", {}).items()
        }
        return cls(
            default_target_currency=data.get("default_target_currency", "USD"),
            status_mapping=status_mapping,
            allocation_mapping=allocation_mapping,
            fx_rates=fx_rates,
            vehicles=vehicles,
            investor_overrides=investor_overrides,
        )


__all__ = [
    "ETLConfig",
    "FxRate",
    "VehicleConfig",
    "InvestorOverride",
    "_slugify_key",
]
