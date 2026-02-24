import matplotlib.pyplot as plt


def scenario_c_income_flows():
    """
    Plot Scenario C income-based annual flows for 10% of Western men.

    Values taken from the appendix (approximate, in USD billions per year):
    - 20% income: ~209
    - 50% income: ~523
    - 80% income: ~836
    """
    rates = [20, 50, 80]
    flows = [209, 523, 836]  # in billions USD

    plt.figure(figsize=(8, 5))
    bars = plt.bar([str(r) + "%" for r in rates], flows, color=["#4C72B0", "#55A868", "#C44E52"])
    plt.ylabel("Annual flow (USD billions)")
    plt.title("Scenario C – Annual income-based flows\n(10% of Western men, approximate)")

    # Annotate bars with values
    for bar, val in zip(bars, flows):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 10, f"{val}", ha="center", va="bottom")

    plt.tight_layout()
    plt.savefig("altruism_scenarioC_income_flows.png", dpi=150)
    plt.close()


def scenario_c_wealth_flows():
    """
    Plot Scenario C wealth-based one-off flows for 10% of Western men.

    Values from the appendix (approximate, in USD billions, one-off):
    - 20% wealth: ~836
    - 50% wealth: ~2090
    - 80% wealth: ~3340
    """
    rates = [20, 50, 80]
    flows = [836, 2090, 3340]  # in billions USD

    plt.figure(figsize=(8, 5))
    bars = plt.bar([str(r) + "%" for r in rates], flows, color=["#4C72B0", "#55A868", "#C44E52"])
    plt.ylabel("One-off flow (USD billions)")
    plt.title("Scenario C – Wealth-based one-off flows\n(10% of Western men, approximate)")

    for bar, val in zip(bars, flows):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 50, f"{val}", ha="center", va="bottom")

    plt.tight_layout()
    plt.savefig("altruism_scenarioC_wealth_flows.png", dpi=150)
    plt.close()


def cross_scenario_flows():
    """
    Cross-scenario comparison of annual flows (very approximate).

    Values (USD billions per year):
    - Baseline global ODA: 200
    - Scenario A (West adults): 500
    - Scenario B (all states at 0.7–1.0% GDP ODA): 850 (midpoint)
    - Scenario C (10% men, 20% income): 210
    - Scenario C (10% men, 50% income): 520
    - Scenario C (10% men, 80% income): 840
    """
    labels = [
        "Baseline ODA",
        "Scenario A\n(West)",
        "Scenario B\n(0.7–1.0% GDP)",
        "Scenario C\n(20% inc)",
        "Scenario C\n(50% inc)",
        "Scenario C\n(80% inc)",
    ]
    flows = [200, 500, 850, 210, 520, 840]  # in billions USD

    plt.figure(figsize=(10, 6))
    bars = plt.bar(labels, flows, color="#4C72B0")
    plt.ylabel("Annual flow (USD billions)")
    plt.title("Cross-scenario comparison of annual altruistic flows\n(approximate)")
    plt.xticks(rotation=20, ha="right")

    for bar, val in zip(bars, flows):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 15, f"{val}", ha="center", va="bottom")

    plt.tight_layout()
    plt.savefig("altruism_cross_scenarios_flows.png", dpi=150)
    plt.close()


def main():
    scenario_c_income_flows()
    scenario_c_wealth_flows()
    cross_scenario_flows()


if __name__ == "__main__":
    main()


