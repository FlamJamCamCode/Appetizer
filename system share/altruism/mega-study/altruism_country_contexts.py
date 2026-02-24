"""
Helpers to build country-specific Context objects for the altruism impact engine.

This module reads macro data from the World Bank CSV and derives simple
Context instances (num_earners, avg_income, corporate profits, etc.) for
each country code. It generalizes what we previously did ad hoc for Mexico.
"""

import csv
from pathlib import Path
from typing import Dict

from altruism_impact import Context


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MACRO_FILE = DATA_DIR / "macro_worldbank_2000_2023.csv"


def load_latest_macro_per_country() -> Dict[str, Dict[str, float]]:
    """
    Load the macro CSV and keep the latest year per country.
    Returns a mapping: code -> {year, gdp_per_capita_usd, population_total, gdp_current_usd}
    """
    latest: Dict[str, Dict[str, float]] = {}
    if not MACRO_FILE.exists():
        raise FileNotFoundError(f"Macro file not found: {MACRO_FILE}")

    with MACRO_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row.get("country_code")
            try:
                year = int(row.get("year", 0))
            except ValueError:
                continue
            if not code or year <= 0:
                continue
            current = latest.get(code)
            if current is None or year > current["year"]:
                try:
                    gdp_pc = float(row.get("gdp_per_capita_usd") or 0.0)
                    pop = float(row.get("population_total") or 0.0)
                    gdp = float(row.get("gdp_current_usd") or (gdp_pc * pop))
                except ValueError:
                    continue
                latest[code] = {
                    "year": year,
                    "gdp_per_capita_usd": gdp_pc,
                    "population_total": pop,
                    "gdp_current_usd": gdp,
                }
    return latest


def context_for_country(code: str) -> Context:
    """
    Build a simple Context for a given ISO3 country code using macro data.
    Heuristics:
    - num_earners ~ 50% of total population.
    - avg_income ~ gdp_per_capita_usd.
    - total_corporate_profits ~ 20% of GDP.
    - total_wealth_top_group ~ 2 * GDP (very rough).
    """
    latest = load_latest_macro_per_country()
    if code not in latest:
        raise KeyError(f"No macro data for country code {code}")
    m = latest[code]
    pop = m["population_total"]
    gdp_pc = m["gdp_per_capita_usd"]
    gdp = m["gdp_current_usd"]

    num_earners = 0.5 * pop
    avg_income = gdp_pc
    total_corp_profits = 0.2 * gdp
    total_wealth_top = 2.0 * gdp

    return Context(
        num_earners=num_earners,
        avg_income=avg_income,
        total_corporate_profits=total_corp_profits,
        total_wealth_top_group=total_wealth_top,
        wealth_horizon_years=20,
        value_per_volunteer_hour=max(avg_income / (2000.0), 5.0),  # crude wage proxy
    )


if __name__ == "__main__":
    # Quick smoke test: build contexts for a few example countries.
    for test_code in ["USA", "MEX", "IND", "NGA"]:
        try:
            ctx = context_for_country(test_code)
            print(
                f"{test_code}: earners={ctx.num_earners:.0f}, "
                f"avg_income={ctx.avg_income:.1f}, "
                f"corp_profits={ctx.total_corporate_profits/1e9:.1f} bn"
            )
        except Exception as e:
            print(f"{test_code}: ERROR {e}")


