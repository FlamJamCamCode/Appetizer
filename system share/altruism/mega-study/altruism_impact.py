"""
Impact evaluation scaffold for altruism packages.

This module provides simple functions to:
- Combine package parameters with high-level macro data.
- Compute monetary and labor volumes.
- Allocate resources across cause areas.
- Estimate illustrative impact metrics using cost-effectiveness parameters.

All numbers here are illustrative and are intended to match the structure
described in section U of `altruism-mega-appendix.md`. They should be replaced
or refined as better data and estimates become available.
"""

from dataclasses import dataclass
from typing import Dict

from altruism_packages import PackageParameters, make_initial_packages
from altruism_cost_effectiveness import load_cost_effectiveness
from altruism_causes import load_causes, package_cause_weights
from altruism_equity import equity_split_for_cause


@dataclass
class Context:
    """High-level macro context for a group of countries or region."""

    # Populations (eligible for different levers)
    num_earners: float  # e.g., millions of people
    avg_income: float   # USD per year

    # Corporate profits (for corporate giving scenarios)
    total_corporate_profits: float  # USD per year

    # For wealth-based scenarios
    total_wealth_top_group: float   # USD (e.g., global top 1% wealth)
    wealth_horizon_years: int = 20  # time horizon over which wealth pledges are realized

    # Volunteer valuation
    value_per_volunteer_hour: float = 25.0  # USD equivalent per hour (illustrative)


def compute_volume(pkg: PackageParameters, ctx: Context) -> Dict[str, float]:
    """
    Compute monetary and labor volumes implied by a package under a given context.
    Returns a dict with keys:
    - money_total
    - money_from_pledges
    - money_from_corporate
    - money_from_wealth
    - volunteer_hours
    - volunteer_value
    """
    # Monetary volumes
    money_from_pledges = pkg.income_pledge_rate * ctx.num_earners * ctx.avg_income
    money_from_corporate = pkg.corporate_profit_share * ctx.total_corporate_profits
    money_from_wealth = 0.0
    if pkg.wealth_pledge_share > 0 and ctx.wealth_horizon_years > 0:
        # Annualized wealth pledge
        money_from_wealth = (
            pkg.wealth_pledge_share * ctx.total_wealth_top_group / ctx.wealth_horizon_years
        )

    money_total = money_from_pledges + money_from_corporate + money_from_wealth

    # Labor volumes
    volunteer_hours = pkg.volunteer_hours_per_year * ctx.num_earners
    volunteer_value = volunteer_hours * ctx.value_per_volunteer_hour

    return {
        "money_total": money_total,
        "money_from_pledges": money_from_pledges,
        "money_from_corporate": money_from_corporate,
        "money_from_wealth": money_from_wealth,
        "volunteer_hours": volunteer_hours,
        "volunteer_value": volunteer_value,
    }


def compute_impact(pkg: PackageParameters, ctx: Context, is_donor_country: bool = False) -> Dict[str, float]:
    """
    Apply a simple impact model:
    - Assume a fraction ea_target_share of resources goes to high-impact uses.
    - The rest goes to moderate-impact uses.
    - Use illustrative cost-effectiveness values in DALYs per 1000 USD.
    """
    volume = compute_volume(pkg, ctx)
    # Combine money and volunteer value into a single effective resource pool
    effective_resources = volume["money_total"] + volume["volunteer_value"]

    # Load generic high/moderate parameters (for backward compatibility)
    ce_generic = load_cost_effectiveness()
    k_high_generic = ce_generic.get("high_global_health", 50.0)
    k_mod_generic = ce_generic.get("moderate_health_poverty", 10.0)

    # Load cause-specific parameters and package cause weights
    ce_causes = load_causes()
    weights_all = package_cause_weights()
    cause_weights = weights_all.get(pkg.name.replace(" ", "_"), None)

    dalys_by_cause: Dict[str, float] = {}
    dalys_by_equity: Dict[str, float] = {
        "domestic_poor": 0.0,
        "domestic_nonpoor": 0.0,
        "foreign_poor": 0.0,
        "foreign_nonpoor": 0.0,
        "future_global": 0.0,
    }

    if cause_weights:
        # Normalize weights in case they don't sum exactly to 1
        total_w = sum(cause_weights.values())
        if total_w <= 0:
            total_w = 1.0
        for cause, w in cause_weights.items():
            share = w / total_w
            k_cause = ce_causes.get(cause, ce_causes.get("low_impact_misc", 1.0))
            dalys_cause = effective_resources * (share * k_cause / 1000.0)
            dalys_by_cause[cause] = dalys_cause
            # Split by equity groups
            eq_split = equity_split_for_cause(cause, is_donor_country=is_donor_country)
            for g, g_share in eq_split.items():
                dalys_by_equity[g] = dalys_by_equity.get(g, 0.0) + dalys_cause * g_share
        dalys_total = sum(dalys_by_cause.values())
    else:
        # Fallback: split into high vs moderate using EA share, as before
        share_high = pkg.ea_target_share
        share_mod = 1.0 - share_high
        dalys_high = effective_resources * (share_high * k_high_generic / 1000.0)
        dalys_mod = effective_resources * (share_mod * k_mod_generic / 1000.0)
        dalys_total = dalys_high + dalys_mod
        dalys_by_cause["high_global_health"] = dalys_high
        dalys_by_cause["moderate_health_poverty"] = dalys_mod
        # Simple equity split using high_global_health pattern
        eq_split = equity_split_for_cause("high_global_health", is_donor_country=is_donor_country)
        for g, g_share in eq_split.items():
            dalys_by_equity[g] = dalys_by_equity.get(g, 0.0) + dalys_total * g_share

    return {
        "effective_resources": effective_resources,
        "dalys_total": dalys_total,
        "dalys_by_cause": dalys_by_cause,
        "dalys_by_equity": dalys_by_equity,
    }


if __name__ == "__main__":
    # Example usage 1: compare all initial packages under a simple global context.
    ctx_global = Context(
        num_earners=500_000_000,         # 500M earners
        avg_income=50_000.0,             # 50k USD/year
        total_corporate_profits=10_000_000_000_000.0,  # 10 tn USD
        total_wealth_top_group=200_000_000_000_000.0,  # 200 tn USD
        wealth_horizon_years=20,
        value_per_volunteer_hour=30.0,
    )

    pkgs = make_initial_packages()
    print("== Global context (illustrative) ==")
    for key, pkg in pkgs.items():
        vol = compute_volume(pkg, ctx_global)
        imp = compute_impact(pkg, ctx_global)
        print(f"{pkg.name}:")
        print(f"  Money total:     {vol['money_total'] / 1e9:8.2f} bn USD")
        print(f"  Volunteer value: {vol['volunteer_value'] / 1e9:8.2f} bn USD")
        print(f"  DALYs total:     {imp['dalys_total'] / 1e6:8.2f} million\n")

    # Example usage 2: country-specific contexts using shared builder.
    from altruism_country_contexts import context_for_country

    for country_code in ["MEX", "IND", "NGA"]:
        ctx_country = context_for_country(country_code)
        print(f"== {country_code} context (from macro data, rough heuristics) ==")
        for key, pkg in pkgs.items():
            vol = compute_volume(pkg, ctx_country)
            imp = compute_impact(pkg, ctx_country)
            print(f"{pkg.name}:")
            print(f"  Money total:     {vol['money_total'] / 1e9:8.2f} bn USD")
            print(f"  Volunteer value: {vol['volunteer_value'] / 1e9:8.2f} bn USD")
            print(f"  DALYs total:     {imp['dalys_total'] / 1e6:8.2f} million\n")



