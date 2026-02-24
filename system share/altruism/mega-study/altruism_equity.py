"""
Equity / distribution configuration for the altruism impact engine.

This module:
- Loads basic equity groups and default shares from `data/equity_config.csv`.
- Provides simple heuristics for how each cause's DALYs are split across
  equity groups (domestic vs foreign, poor vs non-poor, future).

These are intentionally rough and globally uniform for now, but structured so
they can be refined per region/country and per cause later.
"""

import csv
from pathlib import Path
from typing import Dict


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
EQUITY_FILE = DATA_DIR / "equity_config.csv"


def load_equity_defaults() -> Dict[str, float]:
    """
    Load default equity shares per group (global baseline).
    Returns mapping group_key -> share_default.
    """
    shares: Dict[str, float] = {}
    if not EQUITY_FILE.exists():
        # Fallback simple split
        return {
            "domestic_poor": 0.4,
            "domestic_nonpoor": 0.2,
            "foreign_poor": 0.3,
            "foreign_nonpoor": 0.05,
            "future_global": 0.05,
        }

    with EQUITY_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row.get("group_key")
            if not key:
                continue
            try:
                val = float(row.get("share_default") or 0.0)
            except ValueError:
                continue
            shares[key] = val
    return shares


def equity_split_for_cause(cause_key: str, is_donor_country: bool = False) -> Dict[str, float]:
    """
    Return a mapping from equity group to share of DALYs for a given cause.
    For now, use simple heuristics by cause type; is_donor_country can be
    used later to tilt shares toward foreign groups for donor cases.
    """
    base = load_equity_defaults()

    # Start from base and tweak by cause
    # Deep LMIC health causes: malaria, deworming
    if cause_key in {"malaria", "deworming"}:
        split = {
            "domestic_poor": 0.7,
            "domestic_nonpoor": 0.1,
            "foreign_poor": 0.1 if is_donor_country else 0.0,
            "foreign_nonpoor": 0.0,
            "future_global": 0.1,
        }
    elif cause_key == "cash_transfers":
        split = {
            "domestic_poor": 0.8,
            "domestic_nonpoor": 0.1,
            "foreign_poor": 0.0,
            "foreign_nonpoor": 0.0,
            "future_global": 0.1,
        }
    elif cause_key in {"basic_health"}:
        split = {
            "domestic_poor": 0.5,
            "domestic_nonpoor": 0.3,
            "foreign_poor": 0.0,
            "foreign_nonpoor": 0.0,
            "future_global": 0.2,
        }
    elif cause_key == "education":
        split = {
            "domestic_poor": 0.4,
            "domestic_nonpoor": 0.3,
            "foreign_poor": 0.0,
            "foreign_nonpoor": 0.0,
            "future_global": 0.3,
        }
    elif cause_key == "climate":
        split = {
            "domestic_poor": 0.2,
            "domestic_nonpoor": 0.1,
            "foreign_poor": 0.3,
            "foreign_nonpoor": 0.1,
            "future_global": 0.3,
        }
    else:
        # low_impact_misc or unknown cause
        split = base

    # Ensure all required keys exist and normalize to sum to 1
    for k in ["domestic_poor", "domestic_nonpoor", "foreign_poor", "foreign_nonpoor", "future_global"]:
        split.setdefault(k, 0.0)
    total = sum(split.values()) or 1.0
    return {k: v / total for k, v in split.items()}


if __name__ == "__main__":
    for cause in ["malaria", "deworming", "cash_transfers", "basic_health", "education", "climate", "low_impact_misc"]:
        s = equity_split_for_cause(cause)
        print(cause, "->", s)


