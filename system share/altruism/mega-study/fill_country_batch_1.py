"""
Fill country appendix stubs for batch 1 (ISO3 codes starting with A–C)
with macro context and a brief summary of package results.

This uses:
- macro_worldbank_2000_2023.csv for GDP, population, etc.
- global_package_results.csv for country-package impact summaries.
"""

import csv
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
COUNTRIES_DIR = BASE_DIR.parent / "countries"

MACRO_FILE = DATA_DIR / "macro_worldbank_2000_2023.csv"
GLOBAL_RESULTS_FILE = DATA_DIR / "global_package_results.csv"


def load_latest_macro():
    data = {}
    with MACRO_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row["country_code"]
            year = int(row["year"])
            current = data.get(code)
            if current is None or year > current["year"]:
                try:
                    gdp_val = float(row.get("gdp_current_usd") or 0.0)
                except ValueError:
                    gdp_val = 0.0
                try:
                    gdp_pc_val = float(row.get("gdp_per_capita_usd") or 0.0)
                except ValueError:
                    gdp_pc_val = 0.0
                try:
                    pop_val = float(row.get("population_total") or 0.0)
                except ValueError:
                    pop_val = 0.0
                data[code] = {
                    "year": year,
                    "gdp": gdp_val,
                    "gdp_pc": gdp_pc_val,
                    "pop": pop_val,
                }
    return data


def load_country_package_summary():
    """
    For each country, compute total DALYs across all packages
    and also record per-package DALYs to identify the top package.
    """
    per_country = {}
    if not GLOBAL_RESULTS_FILE.exists():
        return per_country

    with GLOBAL_RESULTS_FILE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row["country_code"]
            pkg_name = row["package_name"]
            dalys = float(row.get("dalys_total") or 0.0)
            entry = per_country.setdefault(
                code,
                {"total_dalys": 0.0, "packages": {}},
            )
            entry["total_dalys"] += dalys
            entry["packages"][pkg_name] = entry["packages"].get(pkg_name, 0.0) + dalys

    # Determine top package per country
    for code, info in per_country.items():
        pkgs = info["packages"]
        if pkgs:
            best_name, best_dalys = max(pkgs.items(), key=lambda kv: kv[1])
            info["top_package_name"] = best_name
            info["top_package_dalys"] = best_dalys
    return per_country


def build_content(code: str, macro: dict, pkg_info: dict | None) -> str:
    year = macro["year"]
    gdp_trn = macro["gdp"] / 1e12
    gdp_pc = macro["gdp_pc"]
    pop_m = macro["pop"] / 1e6

    header = f"## Altruism Country Deep Dive – {code}\n\n"
    macro_section = (
        f"### 1. Macro Context (World Bank, {year})\n\n"
        f"- **Population**: ≈ {pop_m:.1f} million\n"
        f"- **GDP (current USD)**: ≈ {gdp_trn:.2f} trillion\n"
        f"- **GDP per capita (current USD)**: ≈ {gdp_pc:,.0f}\n\n"
    )

    if pkg_info:
        total_d = pkg_info.get("total_dalys", 0.0) / 1e9
        top_name = pkg_info.get("top_package_name", "N/A")
        top_d = pkg_info.get("top_package_dalys", 0.0) / 1e9
        pkg_section = (
            "### 2. First-Pass Package Results (Illustrative)\n\n"
            f"- **Total modeled DALYs-equivalent (all packages combined)**: "
            f"≈ {total_d:.2f} billion\n"
            f"- **Top package by modeled DALYs-equivalent**: {top_name} "
            f"(≈ {top_d:.2f} billion DALYs-equivalent)\n\n"
            "_Note_: These are engine outputs based on generic package parameters "
            "and global cost-effectiveness assumptions; they are not country-"
            "specific program evaluations.\n"
        )
    else:
        pkg_section = (
            "### 2. First-Pass Package Results (Illustrative)\n\n"
            "Package results not available yet for this country.\n\n"
        )

    todo_section = (
        "### 3. To Do\n\n"
        "- Add qualitative context on state and private altruism in this country.\n"
        "- Refine package parameters and impact assumptions with country-specific data.\n"
    )

    return header + macro_section + pkg_section + todo_section


def run_for_letters(first_letters: set[str]):
    macro = load_latest_macro()
    pkg_summary = load_country_package_summary()

    processed = 0
    for code, m in macro.items():
        if not code or code[0] not in first_letters:
            continue
        fname = COUNTRIES_DIR / f"altruism_country_{code}.md"
        if not fname.exists():
            continue
        content = build_content(code, m, pkg_summary.get(code))
        fname.write_text(content, encoding="utf-8")
        processed += 1

    letters_str = "".join(sorted(first_letters))
    print(f"Batch processing complete for {letters_str}. Updated {processed} country files.")


if __name__ == "__main__":
    run_for_letters({"A", "B", "C"})


