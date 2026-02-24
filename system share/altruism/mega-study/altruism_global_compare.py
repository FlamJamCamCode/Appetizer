"""
Global comparison layer for altruism packages.

This script:
- Iterates over all countries in the World Bank macro file.
- Builds a Context for each country.
- Evaluates all standard packages for each country.
- Writes a CSV summarizing volumes and DALY impacts per country-package.
- Optionally produces a few high-level comparison plots.

All results remain illustrative until cost-effectiveness inputs are refined.
"""

import csv
from pathlib import Path

import matplotlib.pyplot as plt

from altruism_packages import make_initial_packages
from altruism_impact import compute_volume, compute_impact
from altruism_country_contexts import load_latest_macro_per_country, context_for_country


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUT_CSV = DATA_DIR / "global_package_results.csv"


def run_global_comparison():
    macro = load_latest_macro_per_country()
    pkgs = make_initial_packages()

    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "country_code",
            "year",
            "gdp_per_capita_usd",
            "population_total",
            "package_key",
            "package_name",
            "money_total_usd",
            "volunteer_value_usd",
            "dalys_total",
            "dalys_domestic_poor",
            "dalys_domestic_nonpoor",
            "dalys_foreign_poor",
            "dalys_foreign_nonpoor",
            "dalys_future_global",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for code, m in macro.items():
            try:
                ctx = context_for_country(code)
            except Exception:
                continue
            for key, pkg in pkgs.items():
                vol = compute_volume(pkg, ctx)
                # For now, treat all countries as non-donor for equity; this can
                # be refined later using income group and ODA roles.
                imp = compute_impact(pkg, ctx, is_donor_country=False)
                writer.writerow(
                    {
                        "country_code": code,
                        "year": m["year"],
                        "gdp_per_capita_usd": m["gdp_per_capita_usd"],
                        "population_total": m["population_total"],
                        "package_key": key,
                        "package_name": pkg.name,
                        "money_total_usd": vol["money_total"],
                        "volunteer_value_usd": vol["volunteer_value"],
                        "dalys_total": imp["dalys_total"],
                        "dalys_domestic_poor": imp["dalys_by_equity"].get("domestic_poor", 0.0),
                        "dalys_domestic_nonpoor": imp["dalys_by_equity"].get("domestic_nonpoor", 0.0),
                        "dalys_foreign_poor": imp["dalys_by_equity"].get("foreign_poor", 0.0),
                        "dalys_foreign_nonpoor": imp["dalys_by_equity"].get("foreign_nonpoor", 0.0),
                        "dalys_future_global": imp["dalys_by_equity"].get("future_global", 0.0),
                    }
                )

    print(f"Wrote global package comparison CSV to: {OUT_CSV}")


def plot_global_summary():
    """
    Simple high-level plot: for a few packages, show total DALYs across all countries.
    """
    if not OUT_CSV.exists():
        print("No global_package_results.csv found; run run_global_comparison() first.")
        return

    totals = {}
    with OUT_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row["package_key"]
            dalys = float(row["dalys_total"])
            totals[key] = totals.get(key, 0.0) + dalys

    labels = []
    values = []
    pkgs = make_initial_packages()
    for key, pkg in pkgs.items():
        labels.append(pkg.name)
        values.append(totals.get(key, 0.0) / 1e9)  # scale to billions of DALYs-equivalent

    fig, ax = plt.subplots(figsize=(8, 5))
    x = range(len(labels))
    bars = ax.bar(x, values, color="#4c72b0")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=20, ha="right")
    ax.set_ylabel("Modeled DALYs-equivalent (billions)")
    ax.set_title("Global DALY-equivalent Impact by Package (illustrative)")

    for bar, val in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            bar.get_height(),
            f"{val:.1f}",
            ha="center",
            va="bottom",
            fontsize=8,
        )

    fig.tight_layout()
    out_png = DATA_DIR / "global_package_dalys_summary.png"
    out_svg = DATA_DIR / "global_package_dalys_summary.svg"
    fig.savefig(out_png, dpi=200)
    fig.savefig(out_svg)
    plt.close(fig)
    print(f"Saved global summary plots to: {out_png} and {out_svg}")


if __name__ == "__main__":
    run_global_comparison()
    plot_global_summary()


