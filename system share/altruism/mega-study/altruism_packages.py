"""
Altruism package representations (scaffold).

This module defines data structures for representing the actionable packages
described in section T of `altruism-mega-appendix.md`. It is designed so that
later we can plug these objects into evaluation code that:

- Computes money and labor volumes given macro data.
- Allocates those volumes across cause areas.
- Estimates impact metrics (DALYs, poverty gap, etc.).
"""

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class PackageParameters:
    """
    Core parameters for one actionable package, mostly at a global or
    high-level regional scale. More granular, country-specific parameters
    can be layered on later.
    """

    name: str
    description: str
    target_group: str

    # Monetary levers (shares or rates, expressed as fractions)
    income_pledge_rate: float = 0.0           # e.g., 0.02 for 2% of income
    tax_increase_pp_top: float = 0.0         # percentage points on top earners
    corporate_profit_share: float = 0.0      # e.g., 0.02 for 2% of profits
    wealth_pledge_share: float = 0.0         # e.g., 0.5 for 50% of wealth over horizon

    # Labor levers
    volunteer_hours_per_year: float = 0.0

    # Targeting / allocation
    ea_target_share: float = 0.0             # fraction to high-impact uses

    # Optional free-form extras (e.g., notes on political feasibility)
    metadata: Optional[Dict[str, str]] = None


def make_initial_packages() -> Dict[str, PackageParameters]:
    """
    Create initial package definitions consistent with the table in section T.3.
    Values are illustrative and marked conceptually as *parameters* rather than
    empirical estimates.
    """
    return {
        "A_soft_norm_shift": PackageParameters(
            name="Soft Global Norm Shift",
            description=(
                "Voluntary 1–2% income pledges for middle/high earners, "
                "modest employer-supported volunteering, and 1% of profits "
                "corporate giving."
            ),
            target_group="Middle and high earners, large firms in high-income countries",
            income_pledge_rate=0.015,
            corporate_profit_share=0.01,
            volunteer_hours_per_year=20.0,
            ea_target_share=0.4,
        ),
        "B_tax_and_match": PackageParameters(
            name="Tax & Match",
            description=(
                "Progressive tax increase on top earners earmarked for altruistic "
                "uses, plus government matching of private donations."
            ),
            target_group="Top 5–10% earners in high-income countries",
            income_pledge_rate=0.01,
            tax_increase_pp_top=0.03,
            corporate_profit_share=0.005,
            volunteer_hours_per_year=8.0,
            ea_target_share=0.5,
        ),
        "C_angels_lite": PackageParameters(
            name="Angels-lite",
            description=(
                "Top 10–20% altruistic givers move partway toward Angels-of-Man "
                "giving, with majority of funds directed to globally effective causes."
            ),
            target_group="Top 10–20% altruistic givers globally",
            income_pledge_rate=0.15,
            volunteer_hours_per_year=12.0,
            ea_target_share=0.7,
        ),
        "D_corp_billionaire": PackageParameters(
            name="Corporate & Billionaire Pledges",
            description=(
                "Global billionaires pledge large fractions of wealth; corporations "
                "commit a share of profits to effective causes."
            ),
            target_group="Billionaires and large firms globally",
            wealth_pledge_share=0.5,
            corporate_profit_share=0.02,
            ea_target_share=0.6,
        ),
        "E_volunteer_talent": PackageParameters(
            name="Volunteer & Talent Surge",
            description=(
                "Skilled professionals commit large numbers of hours to pro bono "
                "work and shift careers into high-impact sectors."
            ),
            target_group="Skilled professionals in high-income countries",
            volunteer_hours_per_year=80.0,
            ea_target_share=0.5,
        ),
        "F_solidarity_surcharges": PackageParameters(
            name="Global Solidarity Surcharges",
            description=(
                "Small levies on airfare, financial transactions, or luxury "
                "consumption earmarked for global public goods."
            ),
            target_group="Global consumers and investors",
            corporate_profit_share=0.01,
            ea_target_share=0.4,
        ),
    }


if __name__ == "__main__":
    # Simple sanity check: print package names and key parameters.
    pkgs = make_initial_packages()
    for key, pkg in pkgs.items():
        print(f"{key}: pledge={pkg.income_pledge_rate}, "
              f"tax_pp_top={pkg.tax_increase_pp_top}, "
              f"corp={pkg.corporate_profit_share}, "
              f"wealth={pkg.wealth_pledge_share}, "
              f"vol_hours={pkg.volunteer_hours_per_year}, "
              f"ea_share={pkg.ea_target_share}")


