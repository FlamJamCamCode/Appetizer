"""
Cause-specific configuration and package allocations.

This module:
- Loads cause-level cost-effectiveness parameters from `data/causes_config.csv`.
- Defines, for each package, how its resources are split across causes.
"""

import csv
from pathlib import Path
from typing import Dict


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CAUSES_FILE = DATA_DIR / "causes_config.csv"


def load_causes() -> Dict[str, float]:
    """
    Returns a mapping from cause_key to dalys_per_1000_usd.
    """
    ce: Dict[str, float] = {}
    if not CAUSES_FILE.exists():
        return ce

    with CAUSES_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row.get("cause_key")
            if not key:
                continue
            try:
                val = float(row.get("dalys_per_1000_usd") or 0.0)
            except ValueError:
                continue
            ce[key] = val
    return ce


def package_cause_weights() -> Dict[str, Dict[str, float]]:
    """
    Define how each package's effective resources are allocated across causes.
    Keys are package keys from `altruism_packages.make_initial_packages()`.

    Shares for each package should sum to 1.0 (or less, with remainder implicitly
    treated as low_impact_misc).
    """
    return {
        "A_soft_norm_shift": {
            "basic_health": 0.25,
            "cash_transfers": 0.25,
            "education": 0.2,
            "climate": 0.1,
            "low_impact_misc": 0.2,
        },
        "B_tax_and_match": {
            "malaria": 0.2,
            "deworming": 0.2,
            "basic_health": 0.3,
            "cash_transfers": 0.2,
            "low_impact_misc": 0.1,
        },
        "C_angels_lite": {
            "malaria": 0.25,
            "deworming": 0.25,
            "cash_transfers": 0.2,
            "basic_health": 0.2,
            "education": 0.1,
        },
        "D_corp_billionaire": {
            "malaria": 0.15,
            "deworming": 0.15,
            "cash_transfers": 0.25,
            "basic_health": 0.15,
            "education": 0.15,
            "climate": 0.15,
        },
        "E_volunteer_talent": {
            "basic_health": 0.4,
            "education": 0.4,
            "low_impact_misc": 0.2,
        },
        "F_solidarity_surcharges": {
            "malaria": 0.2,
            "basic_health": 0.3,
            "cash_transfers": 0.2,
            "climate": 0.2,
            "low_impact_misc": 0.1,
        },
    }


if __name__ == "__main__":
    ce = load_causes()
    print("Loaded causes and DALYs per 1000 USD:")
    for k, v in ce.items():
        print(f"  {k}: {v}")


