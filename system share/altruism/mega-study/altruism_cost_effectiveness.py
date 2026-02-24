"""
Cost-effectiveness configuration loader for the altruism impact engine.

This module reads a CSV specifying DALYs per 1000 USD for different cause
categories and makes them available to the impact functions. It replaces
hard-coded toy values with a centrally configurable set of assumptions.
"""

import csv
from pathlib import Path
from typing import Dict

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CE_FILE = DATA_DIR / "cost_effectiveness_default.csv"


def load_cost_effectiveness() -> Dict[str, float]:
    """
    Returns a mapping from cause_key to dalys_per_1000_usd.
    """
    ce: Dict[str, float] = {}
    if not CE_FILE.exists():
        # Fallback to basic defaults if the CSV is missing.
        ce["high_global_health"] = 50.0
        ce["moderate_health_poverty"] = 10.0
        ce["low_impact_misc"] = 1.0
        return ce

    with CE_FILE.open(newline="", encoding="utf-8") as f:
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
    # Ensure some reasonable defaults exist
    ce.setdefault("high_global_health", 50.0)
    ce.setdefault("moderate_health_poverty", 10.0)
    ce.setdefault("low_impact_misc", 1.0)
    return ce


if __name__ == "__main__":
    ce = load_cost_effectiveness()
    for k, v in ce.items():
        print(f"{k}: {v} DALYs per 1000 USD")


