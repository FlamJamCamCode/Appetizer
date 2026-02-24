## Appendix: Altruism, GDP, and Counterfactual Resource Flows

### A.1 Purpose and Structure

This appendix quantifies several counterfactual altruism regimes and compares them to current private and public spending. It is intended as a numerical backdrop for more normative or architectural documents (Triads, NSS, neo-colonialism, etc.).

Scenarios:

- **Scenario A – “Angels of Man as Mass Man” (Utopian Optimistic)**: current top altruists by percentage-of-income set the new distribution for everyone.
- **Scenario B – “Top Altruist State/Tax As All”**: all states allocate resources like today’s most generous states.
- **Scenario C – “10% of Men Part X%”**: 10% of working-age men in Western countries part with substantial fractions of income/wealth.

All values are **orders of magnitude**, not predictions. Where data is uncertain or explicitly invented for thought-experiment purposes, it is marked with an asterisk (**\***).

---

### A.2 Baseline Parameters and Definitions

#### A.2.1 “West” definition and macro baselines

For quantitative convenience, “the West” ≈ high-income OECD + EU + Anglosphere:

- United States, Canada, EU-27, United Kingdom, Norway, Switzerland, Australia, New Zealand.

Approximate macro baselines (mid‑2020s; \* = rounded composite):

- **Population (West)**: ~800 million\*
- **GDP (nominal, West)**: ~USD 40–45 trillion/year\*
- **GDP per capita (West)**: ~USD 50,000–55,000/year\*
- **Male population 16–60 (West)**: ~190 million\*  
  (≈ 25% of total population; typical age/gender structure)

For most calculations below we use:

- \( N_m = 190\text{ million} \) working-age males (16–60)\*
- \( Y_m = \text{USD } 55{,}000 \) average annual pre-tax income per male\*
- \( W_m = \text{USD } 220{,}000 \) average net wealth per male 16–60\* (very rough; actual distribution highly skewed)

Total annual income of working-age males in the West:

\[
I_m = N_m \cdot Y_m \approx 190\text{M} \times 55{,}000 \approx \text{USD } 10.45\text{ trillion/year}^*
\]

#### A.2.2 Current altruism landscape (very compressed)

- **Private giving as % of GDP (formal philanthropy)**:
  - US: ~2.0–2.3% of GDP
  - UK: ~0.8–1.0%
  - Most Western Europe: ~0.3–0.9%\*
  - Japan: ~0.2–0.4%\*
  - Korea, Singapore: ~0.5–1.0%\*
  - Many non-Western countries: <0.3% in tracked tax-deductible giving\*

- **Official Development Assistance (ODA)**:
  - UN target: **0.7% of GNI**.
  - Top donors (Norway, Sweden, Luxembourg, Denmark, Germany): **~0.77–1.0% of GNI**.
  - US: ~0.22% of GNI (largest in absolute dollars, low in share).
  - Global ODA ≈ **USD 200–220 billion/year**.

- **Government domestic social expenditure**:
  - OECD average: **~20–21% of GDP** (pensions, health, unemployment, family benefits, etc.).
  - Nordics: **~25–28%**.
  - US: **~18–20%**.
  - Emerging economies: **~5–15%**\*.

These are the comparators against which scenarios A–C are contrasted.

---

### A.3 Scenario A – “Angels of Man as Mass Man”

#### A.3.1 Conceptual definition

We look at the distribution of individual altruism measured as **percentage of income donated** (not absolute amounts). Exact empirical distributions by percentile are not globally available; Scenario A is explicitly a **thought experiment**.

Let:

- \( p_{90} \): 90th percentile of individuals ranked by % income given.
- \( \mu_{10-1} \): average % income given by the top 10% (90–99th percentile).
- \( \mu_{1-0.1} \): average % income given by the top 1% (99–99.9th percentile).
- \( \mu_{0.1} \): average % income given by the top 0.1%.

Empirically, in rich countries:

- Median giving is often ~0.5–1.0% of income.
- A minority gives 5–10% regularly (religious tithers, serious donors).
- A small elite gives 20–50%+ of income or large wealth chunks.

For concreteness we adopt the following **illustrative values** (\*):

- \( p_{90} \approx 2\% \) of income\*
- \( \mu_{10-1} \approx 5\% \) of income\*
- \( \mu_{1-0.1} \approx 20\% \) of income\*
- \( \mu_{0.1} \approx 50\% \) of income\*

These are not measured; they encode “shape” more than fact.

**Mapping to a new world**:

- Take the **current top 10%** of donors by % income and map them onto the **entire** future distribution:
  - Current top 0.1% → new top 1%
  - Current top 1% → new top 10%
  - Current 90th percentile (threshold of top 10%) → new **baseline** (worst)

So in the Scenario A world:

- **Bottom 90%** now give at least today’s 90th percentile rate.
- The elite are as generous (in relative terms) as today’s most extreme altruists.

#### A.3.2 Scenario A distribution and formula

Scenario A giving rates:

- New bottom 90%: \( g_{0-90} = p_{90} = 2\% \)
- New 90–99%: \( g_{90-99} = \mu_{10-1} = 5\% \)
- New 99–99.9%: \( g_{99-99.9} = \mu_{1-0.1} = 20\% \)
- New top 0.1%: \( g_{99.9-100} = \mu_{0.1} = 50\% \)

Let total income of the considered population be \( I \). Ignoring income variation by percentile (we are on % of income, not amounts), expected giving rate:

\[
\begin{aligned}
G_A &= 0.90 \cdot 0.02 + 0.099 \cdot 0.05 + 0.0009 \cdot 0.20 + 0.0001 \cdot 0.50 \\
&= 0.018 + 0.00495 + 0.00018 + 0.00005 \\
&\approx 0.0232 \quad \text{(2.32% of income)}^*
\end{aligned}
\]

So the population as a whole donates **~2.3% of income** in Scenario A.

#### A.3.3 Scenario A applied to Western working-age males

Take:

- \( N_m = 190\text{M}, \quad Y_m = 55{,}000 \)
- \( I_m = N_m \cdot Y_m \approx 10.45\text{T USD/year} \)

Total donations under Scenario A if applied only to Western males 16–60:

\[
D_{A,m} = G_A \cdot I_m \approx 0.0232 \times 10.45\text{T} \approx \text{USD } 242\text{B/year}^*
\]

If extended to **all Western adults** (men + women, ~500M adults\* with slightly lower income on average), a simple scaling suggests:

- \( D_{A,West} \approx \text{USD } 400–600\text{B/year}^* \)

**Comparison**:

- Global ODA today: **~USD 200–220B/year**.
- Scenario A (West only) plausibly **doubles or triples** current world ODA – and this is purely from private giving.

---

### A.4 Scenario B – “Top Altruist State/Tax As All”

#### A.4.1 Definition

Take the **most altruistic donor states** by ODA as % of GNI (Norway, Sweden, Luxembourg, Denmark, Germany) and imagine that **every country** allocates at least **0.7–1.0% of GDP/GNI** to foreign aid.

We focus first on **foreign aid only**, then comment on domestic social spending.

#### A.4.2 Global ODA if all states matched 0.7–1.0% of GDP

Global nominal GDP (2024):

- \( GDP_{world} \approx \text{USD } 105–110\text{T/year}^* \)

At **0.7%** of GDP:

\[
ODA_{0.7} \approx 0.007 \cdot 105\text{T} \approx \text{USD } 735\text{B/year}^*
\]

At **1.0%** of GDP:

\[
ODA_{1.0} \approx 0.01 \cdot 105\text{T} \approx \text{USD } 1.05\text{T/year}^*
\]

Current ODA ≈ **USD 210B/year**, so:

- **“Top Altruist State As All”** ⇒ ~**3.5–5×** increase in global official aid.

#### A.4.3 Domestic social expenditure uplift

Today:

- Global social spending ≈ **17–18% of global GDP**\*, dominated by rich countries.

If all countries were pushed to **Nordic-level social spending** (~25% of GDP), incremental social outlays would be on the order of **several trillion USD/year**. This is essentially a **global welfare state transformation**.

For this appendix we keep Scenario B’s quantitative focus on **ODA only** but note:

- The “foreign aid uplift” (0.7–1.0% GDP) yields **~0.7–1.0T USD/year**.
- The “social spending uplift” could be easily **2–4T USD/year** in additional domestic transfers and services if fully adopted worldwide.

---

### A.5 Scenario C – “10% of Men Part X%”

#### A.5.1 Definition

Scenario C is deliberately simple:

> 10% of working 16–60 year old men decide to part X amount of their income and wealth. Say at 20% income or 20% wealth or 50% or 80%.

We apply this only to **Western males** to keep numbers intuitive.

Let:

- \( N_m = 190\text{M} \)
- Let fraction participating \( f = 0.10 \Rightarrow N_p = f \cdot N_m = 19\text{M} \).

#### A.5.2 Income-based contributions

Each participating man has income \( Y_m = 55{,}000 \).

Consider contributions \( c \in \{20\%, 50\%, 80\%\} \).

For each case:

\[
D_{inc}(c) = N_p \cdot Y_m \cdot c
\]

- **20% of income**:
  - Per person: 0.20 × 55,000 = **11,000 USD/year**
  - Aggregate:
    \[
    D_{inc}(0.2) = 19\text{M} \cdot 11{,}000 \approx \text{USD } 209\text{B/year}^*
    \]

- **50% of income**:
  - Per person: 0.50 × 55,000 = **27,500 USD/year**
  - Aggregate:
    \[
    D_{inc}(0.5) = 19\text{M} \cdot 27{,}500 \approx \text{USD } 523\text{B/year}^*
    \]

- **80% of income**:
  - Per person: 0.80 × 55,000 = **44,000 USD/year**
  - Aggregate:
    \[
    D_{inc}(0.8) = 19\text{M} \cdot 44{,}000 \approx \text{USD } 836\text{B/year}^*
    \]

#### A.5.3 Wealth-based one-off contributions

Assume average wealth per participating male \( W_m = 220{,}000 \) USD\*.

Consider wealth fractions \( w \in \{20\%, 50\%, 80\%\} \).

\[
D_{wealth}(w) = N_p \cdot W_m \cdot w
\]

- **20% of wealth**:
  - Per person: 0.20 × 220,000 = **44,000 USD**
  - Aggregate:
    \[
    D_{wealth}(0.2) = 19\text{M} \cdot 44{,}000 \approx \text{USD } 836\text{B (one-off)}^*
    \]

- **50% of wealth**:
  - Per person: 0.50 × 220,000 = **110,000 USD**
  - Aggregate:
    \[
    D_{wealth}(0.5) = 19\text{M} \cdot 110{,}000 \approx \text{USD } 2.09\text{T (one-off)}^*
    \]

- **80% of wealth**:
  - Per person: 0.80 × 220,000 = **176,000 USD**
  - Aggregate:
    \[
    D_{wealth}(0.8) = 19\text{M} \cdot 176{,}000 \approx \text{USD } 3.34\text{T (one-off)}^*
    \]

If these one-off transfers are **amortized over 10 years**, effective annual flows are ~one-tenth of the above.

#### A.5.4 Summary table – Scenario C (West; approximate)

| Variant                          | Total flow from 10% of Western men |
|----------------------------------|-------------------------------------|
| 20% of income (per year)        | ≈ **USD 0.21T/year**               |
| 50% of income (per year)        | ≈ **USD 0.52T/year**               |
| 80% of income (per year)        | ≈ **USD 0.84T/year**               |
| 20% of wealth (one-off)         | ≈ **USD 0.84T**                    |
| 50% of wealth (one-off)         | ≈ **USD 2.1T**                     |
| 80% of wealth (one-off)         | ≈ **USD 3.3T**                     |

Even the **20% of income** case (~USD 0.21T/year) is roughly comparable to **current global ODA**.

---

### A.6 Cross-Scenario Comparison

The goal here is to compare orders of magnitude of available resources across scenarios.

Approximate annual flows (USD, mid-2020s; \* = rough range):

| Scenario / Flow                                      | Approximate annual magnitude | Notes                                         |
|------------------------------------------------------|------------------------------|-----------------------------------------------|
| Baseline global ODA                                  | ≈ **0.2T/year**              | Official state foreign aid                    |
| Baseline formal private philanthropy (world)\*       | ≈ **0.8–1.0T/year**          | Very rough; dominated by rich countries       |
| Scenario A (Angels as Mass Man, West adults)\*       | ≈ **0.4–0.6T/year**          | Private, Western only                         |
| Scenario B (all states at 0.7–1.0% GDP ODA)          | ≈ **0.7–1.0T/year**          | State foreign aid only                        |
| Scenario C (10% men, 20% income)                     | ≈ **0.2T/year**              | Similar to current global ODA                 |
| Scenario C (10% men, 50% income)                     | ≈ **0.5T/year**              | ~2.5× current ODA                             |
| Scenario C (10% men, 80% income)                     | ≈ **0.8T/year**              | ~4× current ODA                               |

Observations:

- Modest but focused **private commitments** (10% of Western men at 20–50% of income) can reach or exceed current **state-based global aid**.
- Systemic **state-level norm shifts** (all countries at 0.7–1.0% of GDP in ODA) yield **trillion-scale** foreign aid flows.
- Combining Scenario A (private) and Scenario B (public) would plausibly put **2T+ USD/year** into explicitly altruistic channels at global scale.

---

### A.7 Visualizations

The following figures are generated from a simple Python script (`altruism_scenarios_plots.py`) in the same directory as this appendix. They are illustrative and operate on the simplified numbers above.

- **Figure 1 – Scenario C: Annual income-based flows by contribution rate**  
  `altruism_scenarioC_income_flows.png`

- **Figure 2 – Scenario C: Wealth-based one-off flows by contribution rate**  
  `altruism_scenarioC_wealth_flows.png`

- **Figure 3 – Cross-scenario comparison of annual flows**  
  `altruism_cross_scenarios_flows.png`

To regenerate or modify the plots, adjust the script and re-run:

```bash
python altruism_scenarios_plots.py
```

---

### A.8 Visual References (Markdown Embeds)

*(These assume the script has been run and PNGs exist in the same folder as this file.)*

#### A.8.1 Scenario C – Income-based flows

![Scenario C – Annual income-based flows](./altruism_scenarioC_income_flows.png)

#### A.8.2 Scenario C – Wealth-based one-off flows

![Scenario C – Wealth-based one-off flows](./altruism_scenarioC_wealth_flows.png)

#### A.8.3 Cross-scenario comparison

![Cross-scenario comparison of annual flows](./altruism_cross_scenarios_flows.png)

---

### A.9 Country-Level Context (High-Level)

While the main text uses composite “West” aggregates, the underlying heterogeneity across states matters for design of any NSS / Triad / neo-colonial architectures. Here is a compressed high-level summary of relevant metrics (orthogonal to the scenarios but necessary context).

All numbers approximate mid‑2020s; \* indicates estimated range or stitched from multiple sources.

| Country      | GDP pc (USD)\* | Private giving % GDP\* | Social spending % GDP\* | ODA % GNI\* | Notes                                                   |
|-------------|----------------|------------------------|-------------------------|-------------|---------------------------------------------------------|
| US          | ~80,000        | ~2.0–2.3%              | ~18–20%                 | ~0.22%      | Highest absolute ODA; very high private philanthropy    |
| UK          | ~50,000        | ~0.8–1.0%              | ~21–23%                 | ~0.5%       | Historically 0.7% ODA, recently reduced                 |
| Germany     | ~55,000        | ~0.4–0.6%              | ~25–27%                 | ~0.79%      | Major ODA donor, high social spending                   |
| France      | ~48,000        | ~0.3–0.5%              | ~28–30%                 | ~0.56%      | Very high social spending                               |
| Sweden      | ~60,000        | ~0.8–1.0%              | ~26–28%                 | ~0.90%      | Among top in both ODA share and social expenditure      |
| Norway      | ~90,000        | ~0.8–1.0%              | ~24–26%                 | ~0.99%      | Largest ODA %; oil fund-backed welfare state            |
| Denmark     | ~70,000        | ~0.7–0.9%              | ~25–27%                 | ~0.77%      | Nordic pattern                                          |
| Canada      | ~57,000        | ~1.0–1.2%              | ~19–21%                 | ~0.33%      | Mid-range ODA, strong giving                            |
| Australia   | ~65,000        | ~0.5–0.7%              | ~17–19%                 | ~0.23%      |                                                         |
| Japan       | ~42,000        | ~0.2–0.4%              | ~22–24%                 | ~0.34%      | Large absolute ODA                                      |
| South Korea | ~35,000        | ~0.5–0.7%              | ~15–18%                 | ~0.18%      | Rapidly growing donor                                   |
| Singapore   | ~80,000        | ~0.7–1.0%              | ~14–16%                 | ~0.10%      | High wealth, modest tracked ODA                         |
| UAE         | ~50,000        | <0.3%\*                | ~10–15%\*               | variable\*  | Large non-DAC aid flows, often strategic/regional       |
| Saudi Arabia| ~30,000        | <0.3%\*                | ~12–15%\*               | variable\*  | Zakat, religious and regional aid significant           |
| China       | ~13,000        | <0.5%\*                | ~12–16%\*               | ~0.04–0.1%\*| Large BRI and policy-bank lending; not DAC-classified   |
| India       | ~2,600         | ~0.3–0.5%\*            | ~10–12%\*               | small       | Both donor and major recipient of aid                   |
| Brazil      | ~9,000         | ~0.2–0.4%\*            | ~15–18%\*               | small       |                                                         |
| South Africa| ~6,500         | ~0.3–0.5%\*            | ~15–17%\*               | minimal     |                                                         |
| Belize      | ~5,000–6,000\* | data sparse\*          | ~10–15%\*               | minimal     | Small economy; aid largely inbound, not outbound         |
| Monaco      | ~190,000+\*    | high per capita giving\* | ~?                      | minimal     | Microstate; private philanthropy significant, opaque    |

For more detailed, country-by-country programmatic breakdowns (domestic vs foreign, sectoral allocations), one would build from:

- OECD DAC tables (for ODA volume, type, and sector).
- IMF and World Bank social spending datasets.
- National budget documents and charity commission data.

---

### A.10 Limitations and Next Steps

- Percentages used in Scenario A are **deliberate approximations**; a more empirically grounded variant would require microdata on giving by income/giving percentile.
- Wealth estimates in Scenario C are **crude averages**; real wealth distributions are extremely skewed, implying the same flows could be achieved with **much smaller participating fractions** if one recruited only the top 1–5% by wealth.
- Country-level private giving data is incomplete outside the US/UK; many cultures have significant informal and religious giving that is under-measured.
Possible extensions:

- Re-run Scenario A using real microdata (e.g. US CPS + IRS / UK HMRC charitable deductions, World Inequality Database income distributions).
- Split flows into **domestic vs foreign** in each scenario and compare to existing welfare vs ODA mixes.
- Combine with NSS / Triad models to examine how such flows might be **re-architected**, not merely scaled, and how neocolonial Triads could function as massive “altruism substrates” for deploying these resources.

---

### A.11 Taxonomy of Altruistic Flows

So far we have mostly treated “altruism” as **money flows** (private and public). For a more comprehensive study, distinguish:

- **Monetary donations**:
  - To registered charities, foundations, NGOs.
  - Direct transfers (remittances, mutual aid, “gofundme”, informal).
- **In-kind support**:
  - Food, clothes, goods, housing offered free or below cost.
  - Loans where default is likely and tolerated.
- **Time and effort**:
  - Volunteering in organizations.
  - Unpaid caregiving (family, neighbors, community).
- **Risk-bearing and sacrifice**:
  - Dangerous humanitarian work, conflict-zone medical services.
  - Whistleblowing, reputational risk for the sake of others.
- **Structural, institutional, and political altruism**:
  - Voting or campaigning for redistributive policies.
  - Designing/operating NSS/Triad architectures oriented towards others’ flourishing.

For tractability, this appendix quantifies primarily **monetary flows**, with **volunteering** brought in as an equivalent where data exists.

---

### A.12 Global Individual and Corporate Giving – Orders of Magnitude

Different studies report somewhat different totals, but convergent ranges (all \*):

- **Global individual charitable giving** (formal sector, ~2023–2024):
  - Rough range **USD 1.0–1.5T/year**\*
  - One report places it around **USD 1.3T/year**, with the US ≈ 40–45% of that\*.
- **US alone**:
  - Giving USA / NPTrust-type sources typically report **USD 450–600B/year** of total giving in recent years (individuals, bequests, foundations, corporations combined)\*.
- **Corporate global giving**:
  - Harder to measure; US corporate giving ~USD 20–45B/year depending on definition and year\*.
  - Global corporate figure plausibly **USD 50–100B/year**, but data thin\*.

These numbers imply:

- Formal, recorded **private philanthropy globally** is on the order of **1–1.5% of global GDP** if we include both individual and institutional giving\*.
- The **US** is a major outlier: ~2% of GDP in formal giving, compared to ~0.3–1.0% in most other rich states.

For deep precision, one would:

- Reconcile CAF World Giving Index, Giving USA, NPTrust, regional reports.
- Remove double-counting (e.g. corporate → foundation → NGO chains).

---

### A.13 Volunteering and Non-Monetary Altruism

CAF’s World Giving Index captures three behavior dimensions:

- **Helping a stranger**.
- **Donating money**.
- **Volunteering time**.

Participation rates vary by country but are surprisingly high in many low- and middle-income contexts.

#### A.13.1 US example

US data (mid‑2020s, approximate)\*:

- ~28% of adults volunteer formally in a given year.
- Volunteer hours ~5B hours/year\*.
- Valuation per volunteer hour often taken as **USD 20–30/hour**\*.

A rough “imputed value” of volunteering:

\[
V_{vol,US} \approx 5\text{B hours} \times 25\text{ USD/hour} \approx \text{USD } 125\text{B/year}^*
\]

So, in the US, **time-giving** is roughly a **quarter** of money-giving by value.

#### A.13.2 World Giving Index highlights (qualitative)

Common patterns:

- **Helping strangers** is often highest in countries with strong communal norms and relatively weak formal state safety nets.
- **Volunteering** is strong both in:
  - Rich democracies with many formal organizations.
  - Poor societies with dense community/religious structures.
- **Donating money** is strongly correlated with income, tax incentives, and nonprofit infrastructure.

A future iteration could:

- Construct “effective altruism equivalents” by combining money + imputed time value.
- Model how Scenario A/C-like changes in volunteering would shift total altruistic capacity, not only money.

---

### A.14 Cultural and Religious Structures of Altruism

A full “most comprehensive study” must include **cultural/religious architectures**:

- **Tithing in Christianity**:
  - Norm of giving ~10% of income to the church/charity.
  - In practice, actual tithing rates are much lower; but among those who do tithe, behavior approximates Scenario A top-percentile donors.
- **Zakat in Islam**:
  - Typically ~2.5% of certain forms of wealth annually directed to the poor.
  - Some estimates suggest that if fully collected, global zakat could reach **hundreds of billions USD/year**\*.
- **Dana in Buddhism, Seva in Hinduism/Sikhism**, and other traditions:
  - Emphasize giving, service, and hospitality.
  - Often realized informally (feeding guests, supporting temples/monasteries, community kitchens).

Implications:

- Religious norms often encode **fixed % of wealth/income giving** very similar in form to our scenarios.
- However, much of this giving is **intra-community** and may not target CESETs (Conscious Entities Suffering from Extreme Torment) optimally.
- Triad/NSS architectures could “upgrade” religious giving patterns into more explicitly outcome-oriented, while retaining cultural meaning.

---

### A.15 Historical Trends in Altruism (Sketch)

A chronological sketch (global, highly compressed; further work needed for numbers):

- **Pre‑1900**:
  - Altruism mostly via religious institutions, guilds, mutual aid societies, patronage.
  - No formal welfare states; private and charitable provision central.
- **1900–1945**:
  - Industrialization and urbanization stress traditional support structures.
  - Philanthropic foundations (Carnegie, Rockefeller) begin “scientific philanthropy”.
  - Early welfare laws (poor laws, pensions) emerge in Europe and settler states.
- **1945–1980**:
  - Post‑war boom and construction of welfare states in West.
  - Social spending as % GDP steadily rises; private philanthropy persists but relatively smaller.
  - Decolonization-era foreign aid and development institutions emerge.
- **1980–2000**:
  - Neoliberalism slows expansion of state welfare in some places, expands in others.
  - Growth of NGOs and global civil society; ODA evolves toward structural adjustment, sectoral support.
  - First big data on giving and volunteering appears.
- **2000–2020**:
  - Rise of “strategic philanthropy” and big tech donors.
  - Effective altruism and randomista development as new optimization cultures.
  - CAF World Giving Index launched; philanthropic infrastructure globalizes.
- **2020–present**:
  - COVID‑19 shock tests altruistic systems.
  - Climate philanthropy, AI safety, and other “global catastrophic risk” causes gain attention.
  - Some backlash and criticism of plutocratic philanthropy grows.

Key trend:

- Over the last century, **state-based altruism (social spending + foreign aid)** has grown massively.
- **Private altruism** has grown in absolute terms but is now **one part** of a larger ecosystem.

Scenario B can be seen as “completing” welfare/ODA trajectories; Scenario A/C as “completing” the private side.

---

### A.16 Methodological Caveats (Deeper)

Several deep measurement problems limit any “most comprehensive” attempt:

1. **What counts as altruism?**
   - Is paying taxes for a welfare state altruism or coercion?
   - Is buying “ethical” products altruism or consumption preference?
   - Does family support (parents → children) count?
2. **Intent vs effect**:
   - Many flows labelled “charity” do little for CESETs.
   - Some profit-driven investments (e.g. vaccines) generate huge altruistic side-effects.
3. **Double-counting and chains**:
   - Corporate → foundation → NGO flows can be counted multiple times.
   - ODA flows into government that then finances domestic welfare.
4. **Valuing time and risk**:
   - Volunteer hours, unpaid caregiving, and dangerous service are hard to monetize.
5. **Informal and unrecorded giving**:
   - In many societies, the most important altruistic flows are informal.

Because of this, this appendix:

- Focuses on **formal, measurable flows** as a lower bound.
- Uses **simple imputations** (e.g. volunteer-hour value) where possible.
- Treats all numbers with **explicit epistemic humility** (marking \*).

An NSS/Triad-based reconstruction of altruism would ideally:

- Track **counterfactual outcomes per unit resource** (e.g. DALYs averted, CESET suffering reduced).
- Track **will-topology** (who intended what) separately from **effect-topology** (what happened).

---

### A.17 Directions for Further Iterations

To move towards “the most comprehensive study on altruism ever”, plausible next iterations:

- **Micro-distribution modelling**:
  - Use World Inequality Database + country tax data to simulate giving by income/wealth percentile.
  - Re-run Scenario A/C under realistic income distributions.
- **Cause-area decomposition**:
  - Partition flows into global health, poverty, animal welfare, climate, etc.
  - Compare current allocations with plausible CESET-weighted optimal allocations.
- **Triadization overlays**:
  - Recast each scenario in terms of specific Triads: “Altruism Triad”, “Rare Disease Triad”, “Animal Sanctuary Triad”, etc.
  - Model resource inflows/outflows and NSS competition between altruism architectures.
- **Dynamic simulations**:
  - Write simple agent-based or system-dynamics models that simulate:
    - Norm shifts (Scenario A emergence).
    - Policy shocks (Scenario B implementation).
    - Coalescent movements (Scenario C-type 10% adoption).
  - Study stability, tipping points, and failures.
- **Deeper country-by-country appendices**:
  - One sub-appendix per country with:
    - Fiscal data (social spending, ODA, military).
    - Private giving, volunteering.
    - Cultural/religious giving structures.

These can be appended iteratively as new files (e.g. `altruism_country_US.md`, `altruism_microdistribution_model.md`) and cross-linked from this master appendix.

---

### A.18 Demographic Cluster Mobilization Scenarios

So far, scenarios addressed “everyone”, “all states”, or “10% of Western men”. In practice, some **demographic clusters** are particularly tractable to mobilize or have distinct incentive/topology:

- **Single men** (no dependents).
- **Divorced men** (often high income, fewer obligations after settlements).
- **Childless adults above reproductive age**.
- **Childless adults (all ages)**.
- **Wealth/income deciles or percentiles**.
- **Immigrant demographics**:
  - High net-contributor immigrants in rich countries.
  - Low percentile immigrants net negative in fiscal terms (costly to host), where “foreign aid instead” scenarios can be considered.

The general pattern:

- Some clusters have **high disposable income and flexibility** (e.g. high-earning childless adults).
- Some clusters are **net sinks of public resources** (e.g. low-skilled immigrants in expensive welfare states) where alternative use of those same resources may yield more CESET relief elsewhere.

Below we outline a few stylized cluster scenarios and relate them to global causes-of-death profiles from Our World in Data and WHO data on child mortality and causes of death ([Our World in Data: Causes of Death](https://ourworldindata.org/causes-of-death), [Our World in Data: Child mortality](https://ourworldindata.org/child-mortality), [WHO child mortality and causes of death](https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/child-mortality-and-causes-of-death)).

#### A.18.1 Cluster C1 – High-income childless adults in the West

Define:

- Adults 35–60 in the West with:
  - Income ≥ 1.5× national median.
  - No children (and no intention to have them).

Suppose:

- Population size \( N_{C1} \): guess ~10–20% of Western adults\*.
  - Let’s take **60M** as a working figure\*.
- Average income \( Y_{C1} \): **USD 80,000/year**\*.

If they commit to **Scenario C-style contributions**:

1. **5% of income** (modest):
   \[
   D_{C1,5\%} = 60\text{M} \times 80{,}000 \times 0.05 \approx \text{USD } 240\text{B/year}^*
   \]
2. **10% of income**:
   \[
   D_{C1,10\%} \approx \text{USD } 480\text{B/year}^*
   \]

These flows would be **over and above** other giving.

##### Mapping to causes of death and child mortality

From Our World in Data ([Causes of Death](https://ourworldindata.org/causes-of-death)):

- Global deaths ~56M/year pre‑COVID.
- Leading killers:
  - Cardiovascular diseases (~18M/year).
  - Cancers (~10M/year).
  - Chronic respiratory diseases, diabetes, etc.
- **Under‑5 deaths** ≈ 5M/year; major causes:
  - Diarrheal diseases, pneumonia, malaria, neonatal disorders, malnutrition ([child death causes treemap](https://ourworldindata.org/grapher/major-causes-of-child-deaths)).

Effective, scalable interventions targeting under‑5 mortality (vaccines, ORS for diarrhea, malaria nets, neonatal care, nutrition) often have **cost per life saved** on the order of **USD 3,000–10,000** in the strongest programmes\* (rough EA/Global Health estimates).

If **all of \( D_{C1} \)** were directed optimally to top-tier child-survival interventions:

- At **USD 5,000 per life saved**\*:
  - \( 240\text{B} / 5{,}000 = 48\text{M} \) lives/year.

This vastly exceeds the actual number of under‑5 deaths (~5M/year). Therefore, in practice:

- A fraction of such a cluster commitment **could eliminate most under‑5 mortality** globally in a few years.
- Remaining capacity could shift to other CESET-heavy areas (adult infectious diseases, animal welfare, etc.).

This illustrates the **sheer leverage** of a relatively small cluster if mobilized with high commitment and high outcome-efficiency.

#### A.18.2 Cluster C2 – 10% of “incels” / socially isolated young men

Consider socially isolated young men (“incels”, though heterogenous) in rich countries:

- Often low self-worth, searching for purpose and community.

Rather than focusing on their **income**, one could:

- Model them as a **labor and risk** resource:
  - Willingness to move, take on risky or unpleasant but vital work (e.g. sanitation, epidemic response, animal sanctuary labor, conflict-zone reconstruction under safe protocols).

Suppose:

- 10% of such a group, say **5M globally**\*, devote:
  - 1 year full-time to CESET-focused work.
  - Valued at USD 20,000/year each in net “effective labor value”\* (post training and logistics).

Then:

\[
V_{C2} = 5\text{M} \times 20{,}000 = \text{USD } 100\text{B equivalent labor/year}^*
\]

If directed at bottlenecked operations (hands-on care, field logistics, etc.), this could unlock **funding-limited** interventions, particularly in rural clinics, animal shelters, and conflict/post-disaster zones.

Scenario design:

- Create Triads that **recruit, train, and protect** such men.
- Convert destructive or idle energies into **structured, supervised service**.

#### A.18.3 Cluster C3 – “Low-net” immigrants vs targeted foreign aid

Some migrants in rich welfare states (especially low-skilled, without language skills) may:

- Receive substantial social transfers and public services, while:
  - Contributing relatively little in net taxes, at least for many years.

This is often an **explosive political topic**; here we treat it purely as a resource-allocation thought experiment:

> For one such person, how many **lives or DALYs** could be saved if equivalent fiscal resources were instead deployed as targeted foreign aid in their origin country or similar contexts?

Let:

- Net annual fiscal cost per such immigrant (benefits + services – taxes) ≈ **USD 10,000–30,000/year**\* in high-cost welfare states.

Using the earlier **USD 5,000 per life saved**\* ballpark for child-survival interventions:

- **Per person**:
  - USD 10,000 → ~2 lives/year equivalent.
  - USD 30,000 → ~6 lives/year equivalent.

Therefore:

- **Option 1**: Accept large numbers of low-net immigrants, spending that money domestically on them.
- **Option 2**: Limit such immigration and instead channel equivalent resources into:
  - Vaccinations, neonatal care, malaria prevention, etc. in origin/neighbor countries.

This is not an argument for or against immigration, but a **clarification of trade-offs** in CESET terms.

NSS/Triad version:

- Create “Aid Triads” that transparently receive what would have been net fiscal outlays and deploy them where they mitigate the most CESET suffering, guided by data like Our World in Data’s cause-of-death breakdowns ([Our World in Data: Causes of Death](https://ourworldindata.org/causes-of-death)).

#### A.18.4 Cluster C4 – Top wealth centile globally

Global wealth distributions are extremely skewed:

- The **top 1%** own ~40–50% of global wealth\*.
- The **top 0.1%** own a very large chunk of that.

Let:

- Global household wealth ≈ **USD 500T**\*.
- Top 1% share ≈ 45% ⇒ **225T**.
- Population of top 1% ≈ 80M people (1% of 8B).

If the **top 1%** committed to Scenario A/B-like norms:

- 1% of wealth/year (like a zakat-style wealth tax or commitment on assets):
  - 0.01 × 225T = **2.25T/year**.
- 2% of wealth/year:
  - **4.5T/year**.

These flows dwarf current ODA and philanthropic flows combined.

Applied to:

- Preventable child mortality.
- Adult infectious diseases.
- Animal suffering from industrial agriculture.
- Aging research (large-scale “war on death”).

They could realistically:

- Eradicate many communicable killers targeted in [Our World in Data’s child mortality work](https://ourworldindata.org/child-mortality).
- Majorly accelerate cures/preventions for the leading non-communicable diseases listed in [Causes of Death](https://ourworldindata.org/causes-of-death) (cardiovascular disease, cancer, etc.).

---

### A.19 “Deadly Concern” Targeting and Opportunity Cost

Using cause-of-death data as a guide, any altruistic cluster scenario should answer:

1. **Which causes of death are being targeted?**
   - Under‑5 deaths (diarrhea, pneumonia, malaria, newborn disorders).
   - Adult infectious diseases (HIV, TB).
   - Non-communicable diseases (heart disease, cancers).
   - Injuries, mental health, etc.
2. **What is the cost per death averted or DALY averted for best-known interventions?**
3. **What is the counterfactual** for these resources?

Using Our World in Data and IHME/WHO data ([Our World in Data: Causes of Death](https://ourworldindata.org/causes-of-death), [Our World in Data: Child mortality](https://ourworldindata.org/child-mortality)):

- Many **child deaths** are from low-cost, well-understood causes.
- Many **adult deaths** from non-communicables require more complex and expensive interventions over time (drugs, surgeries, lifestyle shifts).

Implication:

- At **current frontier cost-effectiveness**, directing early additional altruistic flows to **child-survival and basic infectious disease** offers the largest immediate reduction in deaths per dollar.
- As those causes are beaten down, marginal resources shift to:
  - Non-communicable diseases.
  - Aging (longevity).
  - Animal suffering, climate, existential risks.

Cluster scenarios (C1–C4) should therefore be evaluated by:

1. How much **annual spending or labor** they mobilize.
2. How that spending is **triaged across cause-of-death categories**, given their cost curves.
3. The **opportunity costs**, such as:
   - Domestic welfare foregone.
   - Migration foregone.
   - Consumption foregone.

NSS/Triad design goal:

- Architect environments and coalescent movements where:
  - Clusters voluntarily accept certain **opportunity costs** (luxury, certain freedoms).
  - In exchange for maximal **CESET reduction** and **alignment with their deeper will** (e.g. not wanting children but wanting to fight death).

---

*End of current iteration of the altruism–GDP appendix (further iterations expected; cluster-specific sub-appendices to be added).* 




