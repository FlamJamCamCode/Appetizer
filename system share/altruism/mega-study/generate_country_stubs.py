"""
Generate country appendix stub files for the altruism study.

This script reads the World Bank macro CSV and creates country-specific
markdown files in `../countries/` with a generic template, skipping any
files that already exist (e.g., the Mexico deep dive you've already started).
"""

import csv
import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
COUNTRIES_DIR = BASE_DIR.parent / "countries"

MACRO_FILE = DATA_DIR / "macro_worldbank_2000_2023.csv"


def load_countries_from_macro():
    codes = set()
    names = {}
    if not MACRO_FILE.exists():
        raise FileNotFoundError(f"Macro file not found: {MACRO_FILE}")

    with MACRO_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row.get("country_code")
            if not code:
                continue
            codes.add(code)
    # We don't have names in that file; names can be filled later per country.
    return sorted(codes)


def make_stub_content(code: str) -> str:
    return f"""## Altruism Country Deep Dive – {code}

### 1. Context Snapshot (Placeholder)

This file is an automatically generated stub for country `{code}`.
It is intended to be filled out with:

- Macro context (GDP per capita, population, income group, etc.).
- State-based altruism (social spending, aid as donor/recipient).
- Private altruism (charitable giving, remittances, volunteering).
- Country-specific actionable altruism packages and scenarios.

### 2. Data Hooks

- Macro data source: `macro_worldbank_2000_2023.csv` (World Bank).
- Additional data sources: OECD, CAF World Giving Index, national statistics.

### 3. To Do

- Replace this placeholder text with a real country profile.
- Parameterize and evaluate country-specific scenarios using the shared engine.
"""


def main():
    COUNTRIES_DIR.mkdir(parents=True, exist_ok=True)
    codes = load_countries_from_macro()

    created = 0
    skipped = 0

    for code in codes:
        fname = COUNTRIES_DIR / f"altruism_country_{code}.md"
        if fname.exists():
            skipped += 1
            continue
        content = make_stub_content(code)
        with fname.open("w", encoding="utf-8") as f:
            f.write(content)
        created += 1

    print(f"Country stub generation complete. Created: {created}, skipped existing: {skipped}")


if __name__ == "__main__":
    main()


