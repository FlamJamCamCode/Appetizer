## Altruism Mega-Study – Work in Progress

> **Status**: Living document summarizing aims, current coverage, methods explored, and preliminary results. Updated iteratively as the atlas grows.

---

### 1. High-Level Aims

- **Primary aim**: Build the most comprehensive, *decision-useful* atlas of altruism capacity and deployment across the world as possible, with:
  - Quantitative flows: public social spending, ODA, private giving, volunteering.
  - Qualitative structure: cultural/religious norms, cluster-specific opportunities (childless adults, diaspora, incels, tax-haven clients, etc.), and Triad/NSS architectures.
- **Secondary aim**: Design and parameterize counterfactual scenarios (A/B/C, clusters) that:
  - Reallocate or increase resources.
  - Map directly onto **causes of death and suffering** (CESETs) using Our World in Data and WHO mortality data.
- **Meta aim**: Create a set of artifacts (markdown, JSON, R/Python scripts, plots, maybe maps) that are:
  - Machine-readable.
  - Human-readable and persuasive.
  - Extensible by you later without needing me in the loop.

---

### 2. Current State of the Atlas

#### 2.1 Global spine

- `altruism_gdp_appendix.md`:
  - Defines global scenarios:
    - Scenario A: “Angels as Mass Man”.
    - Scenario B: “Top Altruist State as All”.
    - Scenario C: “10% of men part X%”.
  - Introduces:
    - Taxonomy of altruistic flows (money, time, risk, structural).
    - Cause-area mapping (child, communicable, NCD, injuries, aging).
    - Cluster mobilization (high-income childless, incels as labor, low-net immigrants vs foreign aid, global top 1%).
    - Methodological caveats.
  - Anchors preliminary orders-of-magnitude (e.g. ODA ≈ 0.2T, private philanthropy ≈ 1T+).

#### 2.2 Country coverage (prose + JSON)

Each covered country has:

- `countries/altruism_country_XX.md` – prose deep dive.
- `countries/data/altruism_country_XX.json` – machine-readable snapshot.

As of this WIP snapshot, hand-written coverage includes (non-exhaustive list by region):

- **North America & core West**:
  - US, Canada, UK, Germany, France, Italy, Spain, Netherlands, Sweden, Switzerland, Luxembourg, Monaco.
- **Asia / MENA (sampled but not complete)**:
  - China, India, Japan, Indonesia, Pakistan, Bangladesh, Kazakhstan, Türkiye, Saudi Arabia, UAE, Afghanistan, Singapore.
- **Latin America & Caribbean**:
  - Mexico, Brazil, Argentina, Chile, Colombia, Peru, Venezuela, Belize, Panama, Haiti.
- **Africa**:
  - Nigeria, South Africa, Ethiopia, DRC, Niger, Mali, Chad, Burkina Faso, Kenya, Tanzania, Uganda, Rwanda, Ghana, Senegal, Côte d’Ivoire, Sierra Leone, Liberia, The Gambia, Morocco, Algeria, Tunisia, Libya.
- **Tax havens / financial hubs**:
  - Singapore, Switzerland, Luxembourg, Monaco, Cayman Islands, Belize, Panama, Seychelles.

Coverage is still partial vs ~200+ countries, but it now spans:

- Major population centres.
- Representative types:
  - Rich welfare states, emerging economies, low-income/high-mortality states, fragile/conflict states, Islamic zakat cultures, tax havens and wealth hubs.

#### 2.3 Scripts & tools

- `altruism_scenarios_plots.py`:
  - Generates basic PNGs for Scenario C and cross-scenario comparisons.
- `altruism_data_download.R` (partially implemented by you):
  - Designed to pull global data (World Bank, OWID, WHO) for baseline country metrics.
- `altruism_impact.py` (scaffold):
  - Intended to load `countries/data/*.json` and simulate impacts under various scenarios.

---

### 3. Methodologies Explored

#### 3.1 Scenario design & mapping

- **Scenarios A/B/C**:
  - A: Change the *distribution* of altruism (everyone as generous, in % terms, as today’s top decile).
  - B: Change *state norms* (all countries give ODA like the top Nordic donors).
  - C: Focused cluster mobilisation (10% of Western men giving 20–80% of income or 20–80% of wealth).
- **Cluster scenarios**:
  - High-income childless adults.
  - Incels / socially isolated men as *labor and risk* resource.
  - Low-net immigrants vs targeted foreign aid.
  - Top global 1% of wealth (or 0.1%).
  - Religious givers (tithing, zakat).

Each scenario is mapped to:

- Annual flow \( R \) (USD/year).
- Cause-area allocations \( f_i \).
- Approximate “lives saved” or DALYs averted using rough cost-effectiveness bands (e.g. USD 3–10k per child life saved for frontier interventions).

#### 3.2 Country-level decomposition

For each country covered:

- Macro structure:
  - Population, GDP, GDP per capita.
  - Social spending (% GDP).
  - Health and education spending.
  - ODA given & received.
- Altruism structures:
  - Formal private giving (% GDP, total USD).
  - Volunteering rates, informal giving.
  - Religious/cultural giving (zakat, tithing, etc.).
- Cause-of-death context:
  - Under‑5 mortality levels and top causes.
  - Major adult causes (NCDs, communicable, injuries, conflict).
- Triad/NSS opportunities:
  - Country-specific Triads (child survival, aging, refugee/war, climate, animal agriculture, etc.).

This gives a qualitative+quantitative “fingerprint” for each country that can be plugged into the global scenarios.

#### 3.3 Data representation

- JSON schema per country (`countries/data/*.json`) includes:
  - `country_code`, `name`, `population`, `gdp_nominal_usd`, `gdp_per_capita_usd`.
  - `social_spending_pct_gdp`, `health_spending_pct_gdp`, `education_spending_pct_gdp`.
  - `oda_given_pct_gni`, `oda_given_usd`, `oda_received_usd`.
  - `private_giving_pct_gdp`, `private_giving_total_usd`.
  - `volunteering_rate_pct_adults`, `volunteer_hours_billion`.
  - `child_mortality_under5_per_1000`, `top_causes_of_death` (list).
  - `notes`, `sources`.
- Markdown deep dives reference:
  - OWID cause-of-death & child mortality pages.
  - WHO, World Bank, OECD, CAF, etc.

---

### 4. Preliminary Results & Insights

#### 4.1 Scale comparisons

- **Global ODA today**:
  - ≈ **USD 200–220B/year**.
- **Global formal private philanthropy**:
  - Roughly **USD 1–1.5T/year**.
- **Scenario B (“Top Altruist State As All” – 0.7–1.0% GDP ODA)**:
  - ≈ **USD 0.7–1.0T/year** in official foreign aid alone.
- **Scenario C (“10% of Western men at 20–80% of income”)**:
  - 20% income commitment yields ~**0.2T/year** (comparable to all ODA).
  - 50% → ~**0.5T/year**.
  - 80% → ~**0.8T/year**.
- **Cluster C1 (high-income childless adults in the West)**:
  - Plausible flows of **hundreds of billions/year**, enough (on paper) to eliminate almost all under‑5 deaths if fully directed to top-tier interventions.

#### 4.2 Cause-of-death leverage

- OWID + WHO data confirm:
  - Under‑5 mortality (~5M deaths/year) dominated by:
    - Neonatal disorders.
    - Diarrhea, pneumonia.
    - Malaria.
    - Malnutrition.
  - Many of these are **cheaply preventable** with known tools.
- This supports:
  - Prioritising early additional flows into child survival and basic infectious-disease interventions until those burdens are drastically reduced.

#### 4.3 Tax havens & financial hubs as altruism levers

From tax-haven deep dives (CH, LU, SG, BZ, PA, SC, KY, MC, etc.):

- The domestic populations are tiny with relatively low CESET burdens.
- The *real* lever is:
  - Assets under management (AUM), not domestic needs.
- Even a **0.01–0.1% of AUM/year** voluntary or structural commitment could:
  - Produce **multi‑billion USD/year** global altruistic flows.

#### 4.4 Zakat & religious giving

From Islamic-country deep dives (ID, PK, BD, SA, AE, MA, DZ, TN, etc.):

- Zakat and related religious giving:
  - Are structurally similar to Scenario C (fixed % of wealth).
  - Are potentially **hundreds of billions USD/year** globally.
- Currently:
  - Often allocated locally and informally.
  - Impact on CESETs is mixed.
- Triads focusing on **zakat optimisation** could:
  - Convert existing religious obligations into high-efficiency CESET reduction while respecting religious constraints.

---

### 5. How Far Along Are We?

- **Conceptual / architectural**:
  - Core scenario architecture (A/B/C) and cluster logic is in place.
  - NSS/Triad framing is prototyped in multiple country contexts.
- **Coverage**:
  - We have ~50+ country deep dives (prose + JSON) spanning:
    - North America, much of Western Europe, large parts of Africa, major Asian populations, key Latin American states, and key tax havens.
  - Still missing:
    - Many smaller European, African, Asian, Pacific, and Caribbean states.
    - Some high-impact conflict zones (e.g. Syria, Yemen) and smaller regions.
- **Tooling**:
  - Basic plotting for scenarios exists in Python.
  - R and Python scripts can now ingest country JSONs, but:
    - Need more implementation work for interactive maps and systematic impact comparisons.

In short:

- The **spine** and a significant **chunk of the atlas** are there.
- Many more countries and detailed quantitative integration remain to be done, but the existing material already supports:
  - Comparing orders of magnitude between different mobilisation strategies.
  - Reasoning about where (geographically and cause-wise) extra altruism should hit first.

---

### 6. Next Methodological Steps

- **Expand coverage**:
  - Continue adding deep dives and JSONs for remaining countries, especially:
    - Horn of Africa & Sudan/South Sudan.
    - Southern Africa (Mozambique, Malawi, Zambia, Zimbabwe, Angola, etc.).
    - Levant and remaining MENA.
    - Oceania and Pacific islands.
- **Implement microdistribution modeling**:
  - Use `altruism_microdistribution_model.md` as a basis to:
    - Simulate giving by income/wealth percentile.
    - Re-run Scenario A/C under realistic distributions.
- **Cause-area & map integration**:
  - Use `altruism_cause_areas.md` plus OWID grapher endpoints to:
    - Generate real choropleth maps (e.g. under‑5 deaths from diarrhea in 2019).
    - Overlay scenario impact layers (“deaths averted”).
- **Triad systematisation**:
  - From the scattered Triad sketches, build:
    - A more formal catalogue of Triad types.
    - A mapping of which Triads are most relevant for each country.

---

### 7. How to Use This WIP Document

- As a **running checkpoint**:
  - To see what’s already in place.
  - To decide which country/region/cluster to deepen next.
- As a **bridge** between:
  - The conceptual architecture (in `altruism_gdp_appendix.md` and the foundations).
  - The concrete country files and code.

It should be updated periodically as:

- New countries are added.
- Scripts become more advanced.
- We discover better data or adjust assumptions.

---

---

### 8. Project Wrap-Up Snapshot (This Iteration)

#### 8.1 Intent Recap

- Build a global altruism atlas that:
  - Quantifies and qualitatively explains altruistic **capacity** (public, private, religious, financial).
  - Maps **needs** via cause-of-death and suffering (CESETs).
  - Proposes **Triads** and scenarios that match capacity clusters to need clusters in positive-sum ways.

#### 8.2 Progress Summary

- Core scenario and taxonomy scaffolds implemented (`altruism_gdp_appendix.md`, `altruism_cause_areas.md`, `altruism_microdistribution_model.md`).
- Match-making scaffold created with first quantified example (`matchmaking_altruism_triads.md`).
- Dozens of countries covered with prose deep dives + JSON data snapshots, spanning:
  - Major donors (US, CA, DE, FR, UK, SE, NL, JP, etc.).
  - Large emerging economies (CN, IN, BR, MX, ID, PK, BD, ZA, etc.).
  - High-burden African clusters (Sahel, Horn, Great Lakes, Southern, North Africa).
  - Fragile states (AF, HT, VE, CD, SS, SO, SD).
  - Islamic/zakat states and tax/financial hubs.
- R/Python scaffolds in place for:
  - Downloading baseline data.
  - Loading country JSONs.
  - Generating simple scenario plots.

#### 8.3 Methods

- Scenario design (A/B/C and cluster scenarios).
- Country-level welfare and altruism decomposition (macro, ODA, private giving, religious norms, CESET profile).
- Cause-area mapping and cost-effectiveness banding.
- Match-making via conceptual capacity/need vectors and illustrative Triads (Oil-for-Life, Offshore Altruism, Zakat ring, Diaspora optimisation).

#### 8.4 Preliminary Results

- Global ODA (~0.2T USD/year) is small relative to:
  - Private philanthropy (~1–1.5T USD/year).
  - Social spending in rich countries (trillions/year).
- Modest cluster commitments can rival or exceed ODA:
  - 10% of Western men at 20% income ≈ all current ODA.
  - 1% wealth levy on top 1% → multi-trillion flows.
- Cause-of-death data confirm:
  - A large share of under‑5 deaths are cheaply preventable in specific clusters.
- Structural leverage:
  - 1% of oil revenues of a few states is enough to eliminate most preventable child deaths in multiple high-burden countries.
  - Tiny AUM levies in tax havens could fund both global CESET hotspots and long-run public-goods research.
  - Rationalizing existing zakat flows could redirect tens of billions to high-impact child survival and famine prevention.

#### 8.5 Remaining Work (If Resumed)

- Expand country coverage toward full global atlas.
- Tighten data quality for approximated values.
- Implement numeric capacity/need scoring and automatic pairing in `altruism_impact.py`.
- Build real cause-of-death maps and scenario overlays.
- Produce a few hyper-detailed exemplars (e.g. Ethiopia, Egypt, DRC, India).
- Elaborate governance and institutional design for key Triads.

*Last updated in this session; further iterations expected.* 


