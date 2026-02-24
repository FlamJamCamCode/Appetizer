import os

import matplotlib.pyplot as plt


def ensure_output_dir():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return base_dir


def plot_scenario_volumes(output_dir: str):
    """
    Figure 1 – Scenario Donation Volumes (Western Focus).

    Note: Many values here are illustrative thought-experiment numbers (*),
    constructed to match the descriptions in the accompanying markdown appendix.
    """
    labels = [
        "Current global ODA\n(empirical range)",
        "Angels of Man\n(Western private)",
        "10% Western men\n20% income *",
        "10% Western men\n50% income *",
        "10% Western men\n80% income *",
        "Top 10% giving\nextrapolated to all *",
    ]

    # Values in billions of USD (approximate / illustrative)
    values = [
        210,    # ~200–220 bn
        1350,   # 1.35 tn*
        195,    # 195 bn*
        488,    # 487.5 bn*
        780,    # 780 bn*
        3000,   # 3.0 tn*
    ]

    fig, ax = plt.subplots(figsize=(10, 6))
    x = range(len(labels))

    bars = ax.bar(x, values, color=["#4c72b0", "#55a868", "#c44e52", "#8172b3", "#ccb974", "#64b5cd"])
    ax.set_ylabel("Annual amount (billion USD)")
    ax.set_title("Scenario Donation Volumes – Western Focus\n(illustrative; * marks thought experiments)")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=20, ha="right")

    # Annotate bars
    for bar, val in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            bar.get_height(),
            f"{val:,}",
            ha="center",
            va="bottom",
            fontsize=8,
        )

    fig.tight_layout()
    fig_path_png = os.path.join(output_dir, "figure1_scenario_volumes.png")
    fig_path_svg = os.path.join(output_dir, "figure1_scenario_volumes.svg")
    fig.savefig(fig_path_png, dpi=200)
    fig.savefig(fig_path_svg)
    plt.close(fig)


def plot_state_aid_scenarios(output_dir: str):
    """
    Figure 2 – State-Level Altruism Scenarios vs. Actual ODA.
    """
    labels = [
        "Actual global ODA\n(empirical range)",
        "Top Altruist State as All\nODA scenario *",
    ]
    values = [
        210,   # ~200–220 bn
        990,   # ~0.9% of 110 tn*
    ]

    fig, ax = plt.subplots(figsize=(6, 5))
    x = range(len(labels))
    bars = ax.bar(x, values, color=["#4c72b0", "#55a868"])

    ax.set_ylabel("Annual amount (billion USD)")
    ax.set_title("State-Level Altruism – Actual vs Scenario ODA\n(illustrative; * marks thought experiment)")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15, ha="right")

    for bar, val in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            bar.get_height(),
            f"{val:,}",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.tight_layout()
    fig_path_png = os.path.join(output_dir, "figure2_state_oda_scenarios.png")
    fig_path_svg = os.path.join(output_dir, "figure2_state_oda_scenarios.svg")
    fig.savefig(fig_path_png, dpi=200)
    fig.savefig(fig_path_svg)
    plt.close(fig)


def plot_social_vs_private_scale(output_dir: str):
    """
    Figure 3 – Relative Scale of State Social Spending vs. Private Altruism.

    Values are illustrative and combine empirical orders-of-magnitude
    (e.g., global social expenditure) with thought-experiment scenarios.
    """
    labels = [
        "Global social spend\n(current, rough)*",
        "Social spend if all at\n28% GDP (scenario)*",
        "Angels of Man\n(West private)*",
        "Top10 behavior to all\n(West private)*",
    ]

    # in trillion USD
    values_trn = [
        20,   # rough current social spending ballpark*
        30.8, # 28% of 110 tn*
        1.35, # Angels of Man*
        3.0,  # top10 extrapolated*
    ]

    fig, ax = plt.subplots(figsize=(8, 5))
    x = range(len(labels))
    bars = ax.bar(x, values_trn, color=["#4c72b0", "#55a868", "#c44e52", "#8172b3"])

    ax.set_ylabel("Amount (trillion USD)")
    ax.set_title("State Social Spending vs. Private Altruism Scenarios\n(illustrative; * marks thought experiments)")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15, ha="right")

    for bar, val in zip(bars, values_trn):
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            bar.get_height(),
            f"{val:.2f}",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.tight_layout()
    fig_path_png = os.path.join(output_dir, "figure3_social_vs_private_scale.png")
    fig_path_svg = os.path.join(output_dir, "figure3_social_vs_private_scale.svg")
    fig.savefig(fig_path_png, dpi=200)
    fig.savefig(fig_path_svg)
    plt.close(fig)


def main():
    out_dir = ensure_output_dir()
    plot_scenario_volumes(out_dir)
    plot_state_aid_scenarios(out_dir)
    plot_social_vs_private_scale(out_dir)


if __name__ == "__main__":
    main()


