## Altruism Cause-Area Mapping and World Map Scaffold

> **Status**: First-pass conceptual and technical scaffold. Cause-area mapping uses approximate ranges; data and scripts can be expanded iteratively. Some references: [Our World in Data – Causes of Death](https://ourworldindata.org/causes-of-death), [Our World in Data – Child mortality](https://ourworldindata.org/child-mortality).

### 1. Purpose

To connect:

- **Resource flows** from scenarios (A, B, C, clusters).
- **Concrete causes of death and suffering** across countries.

and to provide:

- A structured **cause-area taxonomy**.
- A scaffold for **interactive world maps** that show:
  - Where deaths from cause X occur.
  - What “lives/DALYs per dollar” looks like.
  - How scenario-driven flows would interact with this landscape.

### 2. Cause-Area Taxonomy (Human)

Using Our World in Data / IHME cause-of-death structure as a base:

1. **Child mortality (<5)**:
   - Neonatal disorders (preterm birth, asphyxia, infections).
   - Diarrheal diseases.
   - Lower respiratory infections (pneumonia).
   - Malaria.
   - Malnutrition.
2. **Communicable and maternal health (all ages)**:
   - HIV/AIDS.
   - Tuberculosis.
   - Malaria (older children, adults).
   - Neglected tropical diseases.
   - Maternal causes.
3. **Non-communicable diseases (NCDs)**:
   - Cardiovascular diseases (heart attacks, strokes).
   - Cancers.
   - Chronic respiratory diseases (COPD, asthma).
   - Diabetes and kidney disease.
4. **Injuries and external causes**:
   - Road injuries.
   - Falls.
   - Drownings, burns.
   - Suicide, homicide, conflict.
5. **Aging / “mortality from age itself”**:
   - Not just premature disease but the overall deterioration processes described as “hallmarks of aging”.

### 3. Non-Human Altruism Cause-Areas (Sketch)

Beyond humans:

1. **Farmed animals**:
   - Land animals: chickens, pigs, cattle, sheep.
   - Aquaculture and wild-caught fish.
2. **Wild animals**:
   - Suffering from starvation, disease, predation.
   - Habitat destruction, pollution.
3. **Ecosystems & climate**:
   - Long-run impact on CESETs via biodiversity loss, climate-change induced disasters.

Mapping these thoroughly requires separate appendices; here we focus mostly on human causes while acknowledging the broader space.

### 4. Baseline Human Causes of Death – Global Snapshot

From [Our World in Data – Causes of Death](https://ourworldindata.org/causes-of-death):

- Total deaths ≈ 56M/year (pre-COVID).
- Breakdown:
  - Cardiovascular diseases: ~18M deaths/year.
  - Cancers: ~10M/year.
  - Chronic respiratory diseases: ~4M/year.
  - Lower respiratory infections: ~2.6M/year.
  - Neonatal causes: ~2M/year.
  - Diarrheal diseases: ~1.5M/year.
  - Road injuries: ~1.3M/year.
  - Malaria: ~0.6M/year.
  - Tuberculosis: ~1.2M/year.
  - HIV/AIDS: ~0.7M/year.

Under‑5 mortality:

- ~5M deaths/year.
- Infectious diseases and neonatal disorders dominate.

### 5. Very Rough Cost-Effectiveness Bands (Human)

Based on work by global health orgs and effective altruism literature (GiveWell, etc.), typical order-of-magnitude bands (all **\***):

- Best “child death-averting” interventions:
  - In the vicinity of **USD 3,000–10,000 per child life saved**\*.
  - E.g. anti-malarial nets, vitamin A, vaccines, ORS/antibiotics + associated system costs.
- Many NCD interventions (e.g. hypertension treatment, statins) deliver:
  - Good DALY cost-effectiveness but more “chronic” than discrete death-aversion.
- Aging/anti-aging R&D:
  - High uncertainty; potentially enormous long-run payoff, but near-term cost per life saved is hard to define.

These are intended only as **directional anchors** for scenario mapping, not precise metrics.

### 6. Mapping Scenarios to Cause-Areas

Given a scenario with annual resource flow \( R \) (USD/year), we can:

1. Allocate a fraction \( f_{child} \) to under‑5 death causes.
2. Allocate \( f_{inf} \) to adult communicable disease.
3. Allocate \( f_{ncd} \) to NCD interventions.
4. Allocate \( f_{aging} \) to aging research.
5. Allocate \( f_{other} \) elsewhere (animal welfare, climate, etc.).

with:

\[
f_{child} + f_{inf} + f_{ncd} + f_{aging} + f_{other} = 1
\]

For each cause-area, given a cost per life saved \( c_i \), the number of lives saved in that area per year ≈:

\[
L_i \approx \frac{f_i \cdot R}{c_i}
\]

The total lives saved across all cause-areas:

\[
L_{\text{total}} = \sum_i L_i
\]

### 7. World Map Scaffold – Technical Sketch

Goal:

- Provide interactive world maps showing:
  - Baseline death rates by cause.
  - Scenario-induced perturbations (e.g. how many deaths prevented per country).

Data:

- Our World in Data provides machine-readable datasets and grapher endpoints:
  - Example: `https://ourworldindata.org/grapher/number-of-deaths-by-cause.csv` (schema should be checked before actual use).
  - Child causes: `https://ourworldindata.org/grapher/major-causes-of-child-deaths.csv`.
  - Mortality rates: `https://ourworldindata.org/grapher/child-mortality-igme.csv`.

Implementation idea (Python + Plotly):

- Download relevant data using `pandas.read_csv` from OWID grapher URLs.
- Clean and aggregate by country and cause for a given year (e.g. 2019).
- Create choropleth maps using Plotly (or other libraries) with:
  - Color intensity = death rate or number of deaths for chosen cause.
  - Hover info = country, deaths, rate, leading causes, scenario impact.

You can then:

- Run a Jupyter notebook or script to:
  - Generate static HTML map files.
  - Or produce static PNG/SVG for embedding.

### 8. Example Python Skeleton for a Cause-of-Death Map

```python
import pandas as pd
import plotly.express as px

# Example: load a generic causes-of-death dataset (schema must be adapted to actual OWID file)
url = "https://ourworldindata.org/grapher/number-of-deaths-by-cause.csv"
df = pd.read_csv(url)

# Assume columns like: entity, code, year, cause, deaths
# Filter to a specific year and cause, e.g. 'Diarrheal diseases'
year = 2019
cause_of_interest = "Diarrheal diseases"

df_year = df[(df["year"] == year) & (df["cause"] == cause_of_interest)]

fig = px.choropleth(
    df_year,
    locations="code",  # ISO3 country codes
    color="deaths",
    hover_name="entity",
    color_continuous_scale="Reds",
    title=f"Number of deaths from {cause_of_interest}, {year}"
)

fig.write_html("map_deaths_diarrhea_2019.html")
fig.write_image("map_deaths_diarrhea_2019.png")
```

Notes:

- The real OWID dataset may have a different schema; the script must be adapted accordingly.
- More sophisticated dashboards could allow:
  - Drop-down selection of cause and year.
  - Layering scenario impacts (e.g. overlaying “deaths prevented” as contours or bubbles).

### 9. Scenario Impact Overlays on Maps

Given scenario R and allocation fractions \( f_i \), plus a model for:

- Where interventions are deployed (which countries/regions).
- Country-level cost per life saved (which depends on baseline disease burden, health system capacity).

We can:

1. Distribute the scenario resources \( R \) across countries for a cause.
2. Compute estimated deaths averted \( \Delta L_{i,country} \).
3. Generate maps showing:
   - **Baseline deaths** vs **post-scenario deaths**.
   - Or **fraction of deaths averted** per country.

A more advanced iteration could use:

- Country-level cause-specific mortality from OWID/WHO.
- Simple formulas like:

  \[
  \Delta L_{i,c} \approx \min\left( \frac{\text{R}_{i,c}}{c_i}, L_{i,c} \right)
  \]

  where:
  - \( L_{i,c} \): baseline deaths from cause i in country c.
  - \( \text{R}_{i,c} \): resources directed to cause i in country c.

### 10. Integration with Altruism Scenarios and Clusters

For each main scenario (A, B, C, clusters C1–C4 in the master appendix):

- Compute annual flow \( R \).
- Choose cause-area allocation \( f_i \).
- Choose geographic allocation:
  - e.g. prioritize low-income countries with high burden in cause i.

Then:

- Use the world map scaffold to:
  - Visualise where the scenario “bites”.
  - Explore trade-offs (e.g. focusing on a few countries vs spreading thin).

### 11. Future Work

Subsequent iterations can:

- Add:
  - Separate maps for each cause-area.
  - Time-evolution (2010–2040) under various “scale up” paths.
  - Country dashboards that combine:
    - Current altruism inflows.
    - Domestic social spending.
    - Scenario-induced changes.
- Integrate with Triad/NSS architectures:
  - “Click country → see which Triads are operating and how they use resources”.

---

*End of first iteration of cause-area mapping and world map scaffold.* 


