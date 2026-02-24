## Altruism Microdistribution Model – Scaffold

> **Status**: Conceptual model and outlines for simulation; numbers are indicative and marked with **\*** where approximate. Intended to be backed by code in later iterations.

### 1. Goal

To move from coarse “% of GDP” and “average income” perspectives to:

- **Distribution-aware models** of altruism:
  - Giving as a function of income and wealth percentiles.
  - Cluster-specific behaviors (childless, incels, immigrants, etc.).
  - Scenario overlays (Angels as Mass Man, 10% of men part X%, etc.).

This allows:

- Evaluating **feasibility** of scenarios (how many people at what income could sustain them).
- Identifying **high-leverage slices** of the distribution for recruitment.

### 2. Basic Ingredients

For a given country/region:

1. **Income distribution**:
   - Use quantiles or full distribution (e.g. lognormal or Pareto tail).
   - Data sources: World Inequality Database, LIS, CPS, national tax data.
2. **Wealth distribution**:
   - Often even more skewed than income.
   - Data sources: World Inequality Database, national wealth surveys.
3. **Baseline giving rates**:
   - Giving as % of income and/or wealth by income/wealth percentile.
   - Data sources: tax-deductible donations by income bracket, philanthropic surveys (e.g. CAF).
4. **Scenario deviation**:
   - Multiplier or replacement for giving rates in chosen segments.

### 3. Stylized Model Structure

Let:

- \( y \): individual income.
- \( w \): individual wealth.
- Income distribution: \( f_Y(y) \).
- Wealth distribution: \( f_W(w) \).

Baseline giving function:

\[
g_0(y, w) = \alpha(y) \cdot y + \beta(w) \cdot w
\]

where:

- \( \alpha(y) \): income-based giving fraction, possibly piecewise by y-quantile.
- \( \beta(w) \): wealth-based giving fraction (often zero for most, positive for wealthy).

Scenario A-style overlay:

\[
g_A(y, w) = \gamma(y, w) \cdot y
\]

Scenario C-style overlay (10% of men part X%):

\[
g_C(y, w) =
\begin{cases}
c \cdot y & \text{if } (y,w) \in \text{target cluster} \\
g_0(y, w) & \text{otherwise}
\end{cases}
\]

where \( c \) is 0.2, 0.5, 0.8, etc.

Total giving:

\[
G = \int g(y,w) f_{Y,W}(y,w) \, dy \, dw
\]

### 4. Toy Example – Two-Decile Model

For intuition, a simple country model:

- Bottom 90%:
  - Average income: \( y_L \), wealth \( w_L \).
  - Baseline giving: 1% of income.
- Top 10%:
  - Average income: \( y_H = 5y_L \)\*.
  - Average wealth: \( w_H = 20w_L \)\*.
  - Baseline giving: 4% of income.

Scenario C (targeting top 10%):

- Replace 4% with 20% giving.

Baseline total giving (income-based only):

\[
G_0 = 0.9 \cdot 0.01 y_L + 0.1 \cdot 0.04 \cdot 5 y_L = 0.009 y_L + 0.02 y_L = 0.029 y_L
\]

Scenario C:

\[
G_C = 0.9 \cdot 0.01 y_L + 0.1 \cdot 0.20 \cdot 5 y_L = 0.009 y_L + 0.10 y_L = 0.109 y_L
\]

So:

- Giving goes from ~2.9% of \( y_L \) to ~10.9% of \( y_L \).
- This is a **~3.8× increase**, purely by changing behavior of the top decile.

### 5. Script Outline (Python/R)

Future code (not yet implemented) will:

- Load country-level income/wealth distributions.
- Parameterize baseline giving functions.
- Define cluster membership conditions.
- Simulate and plot:
  - Baseline giving distribution.
  - Scenario overlays.
  - Contribution by percentile/cluster.

Example skeleton in Python:

```python
import numpy as np
import pandas as pd

# Load or simulate income distribution
N = 1_000_000
incomes = np.random.lognormal(mean=10, sigma=0.7, size=N)  # toy

def baseline_alpha(y):
    # income-based giving fraction
    if y < 30_000:
        return 0.01
    elif y < 100_000:
        return 0.02
    else:
        return 0.03

vec_alpha = np.vectorize(baseline_alpha)

baseline_giving = vec_alpha(incomes) * incomes

# Scenario C: top 10% give 20%
threshold = np.percentile(incomes, 90)
scenario_c_giving = baseline_giving.copy()
mask = incomes >= threshold
scenario_c_giving[mask] = 0.20 * incomes[mask]

print("Baseline total giving:", baseline_giving.sum())
print("Scenario C total giving:", scenario_c_giving.sum())
```

R version can follow similarly using `rlnorm`, `dplyr`, etc.

### 6. Integration with Country Deep Dives

Each country deep dive (e.g. `altruism_country_US.md`, `altruism_country_India.md`) can:

- Embed country-specific microdistribution models, using:
  - Empirical income deciles/percentiles.
  - Observed giving rates by bracket.
  - Scenario overlays for specific clusters (childless adults, incels, immigrants).

Outputs:

- Graphs of giving by percentile.
- Tables of total additional flows under each scenario.
- CESET impact ranges when mapped to cause-of-death cost-effectiveness.

### 7. Next Steps

- Attach actual data sources per country.
- Implement scripts to generate:
  - Lorenz-type curves for giving.
  - Histograms and density plots.
  - Cross-country comparisons of “altruism Gini” (inequality of giving).

These will then be referenced from the master `altruism_gdp_appendix.md` and the country-specific appendices.

---

*End of first iteration of the microdistribution model scaffold.* 


