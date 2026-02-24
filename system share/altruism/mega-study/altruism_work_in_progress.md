## Altruism Mega-Study – Work in Progress Overview

### 1. Aims of the Project

The overarching aim is to build the **most comprehensive, structured, and extensible quantitative study of altruism** we can:

- **Global scope**: cover essentially all countries (World Bank set), not just a few rich states.
- **Multi-channel altruism**: include private giving, government social spending, foreign aid, remittances, volunteering, and talent flows.
- **Scenario and package modeling**: define and compare concrete “actionable packages” of policies, norms, and behaviors (e.g., tax & match, Angels-lite, corporate/billionaire pledges, volunteer surges).
- **Impact focus**: translate money and time into **impact units** (currently DALYs-equivalent) via explicit cost-effectiveness assumptions rather than treating dollars as ends in themselves.
- **Equity and feasibility (planned)**: track who benefits (domestic vs foreign, poorest deciles vs others, current vs future generations) and distinguish “ideal” from “feasible” scenarios.

The end state is a **living atlas and engine** that policymakers, researchers, and interested individuals can use to explore “what if” questions about altruism at country and global scale.

---

### 2. What Is Already Implemented

#### 2.1 Data and Country Coverage

- **World Bank macro data**:
  - `macro_worldbank_2000_2023.csv` (in `mega-study/data`) holds GDP, GNI, GDP per capita, and population for **all World Bank countries from 2000–2023**.
  - Scripts:
    - `altruism_data_download.R` (downloads macro and SOCX data with caching and basic robustness).
    - `altruism_data_pipeline.R` (builds placeholder summaries and joins).

- **Country atlas**:
  - One markdown file per ISO3 country code in `countries/`:
    - `altruism_country_XXX.md` (e.g., `altruism_country_MEX.md`, `altruism_country_IND.md`).
  - Generated via:
    - `generate_country_stubs.py` (initial stubs).
    - `fill_country_batch_1..5.py` (fill in macro context and first-pass package results in batches A–Z).

- **Country contexts in code**:
  - `altruism_country_contexts.py` builds a `Context` object per country:
    - `num_earners` (≈50% of population by default).
    - `avg_income` (≈GDP per capita).
    - `total_corporate_profits` (≈20% of GDP).
    - `total_wealth_top_group` (≈2× GDP).
  - This feeds directly into the impact engine.

#### 2.2 Package and Impact Engine

- **Package definitions**:
  - `altruism_packages.py` defines a small set of **actionable packages**:
    - Soft Global Norm Shift, Tax & Match, Angels-lite, Corporate & Billionaire Pledges, Volunteer & Talent Surge, Global Solidarity Surcharges.
  - Each package has:
    - Income pledge rate, tax increase, corporate profit share, wealth pledge share.
    - Volunteer hours per person per year.
    - EA targeting share.

- **Volume and impact core**:
  - `altruism_impact.py`:
    - Computes monetary volumes (from pledges, taxes, corporate shares, wealth) and labor volumes (volunteer hours, valued via wage proxy).
    - Combines them into an **effective resource pool**.
    - Uses cost-effectiveness parameters (see below) to compute:
      - DALYs-equivalent per package, per country.
      - Now also a **breakdown by cause**.

- **Cost-effectiveness configuration**:
  - `altruism_cost_effectiveness.py` + `data/cost_effectiveness_default.csv`:
    - Provide DALYs-per-1,000-USD for generic categories:
      - `high_global_health`, `moderate_health_poverty`, `low_impact_misc`.
    - Values are **order-of-magnitude estimates**, starred in documentation as approximate and adjustable.

#### 2.3 Cause-Specific Modeling

- **Cause-level parameters**:
  - `data/causes_config.csv` defines explicit causes:
    - Malaria, deworming, cash transfers, basic health, education, climate, low_impact_misc.
    - Each with DALYs-per-1,000-USD and textual notes.

- **Cause module**:
  - `altruism_causes.py`:
    - Loads cause DALY parameters.
    - Defines how each package allocates its resources across causes (cause weight vectors per package).

- **Engine integration**:
  - `altruism_impact.py` now:
    - Uses `load_causes()` and `package_cause_weights()` to split a package’s resources across causes.
    - Computes `dalys_by_cause` and `dalys_total`.
    - Falls back to the older high/moderate split if no cause weights are defined, to keep backward compatibility.

#### 2.4 Global Comparison Layer

- `altruism_global_compare.py`:
  - Iterates over all countries with macro data.
  - For each country + each package:
    - Builds a `Context`.
    - Runs `compute_volume` and `compute_impact`.
  - Writes `data/global_package_results.csv`:
    - Columns: country code, year, GDP per capita, population, package key/name, money_total, volunteer_value, dalys_total.
    - (Note: currently only total DALYs are persisted; per-cause numbers are available in-code and can be added to the CSV later.)
  - Produces `data/global_package_dalys_summary.png/svg`: a simple bar chart of total DALYs-equivalent by package globally.

---

### 3. Methodologies Explored So Far

1. **Macro-based context building**  
   - Use World Bank GDP, GDP per capita, and population to derive:
     - Number of earners (simple 50% heuristic).
     - Average income (GDP per capita).
     - Corporate profits (20% of GDP).
     - Top-group wealth (2× GDP).
   - Advantages: simple, globally available, easy to refine later with better assumptions.

2. **Package-driven scenario modeling**  
   - Represent each “actionable package” as a small vector of parameters:
     - Pledge rates, tax changes, corporate shares, volunteer hours, EA targeting share.
   - Compute volumes by multiplying these parameters with country contexts.
   - Use the same package definitions everywhere, then later adjust for feasibility.

3. **Cost-effectiveness-based impact translation**  
   - Instead of treating dollars as the endpoint, convert them into DALYs-equivalent using:
     - Generic high/moderate/low cost-effectiveness values.
     - Cause-specific DALYs-per-1,000-USD for malaria, deworming, cash transfers, etc.
   - This is explicit, configurable, and marked as approximate pending better inputs.

4. **Global coverage via automation**  
   - Use Python scripts to:
     - Generate country appendix stubs.
     - Fill them in batches with macro context and first-pass package results.
   - This yields a **mechanically complete atlas** where every country has at least a minimal quantitative profile.

5. **Robust, cached data downloads**  
   - `altruism_data_download.R`:
     - Downloads World Bank data for all countries once; re-runs skip download if files already exist.
     - Attempts to fetch OECD SOCX and DAC data, with graceful failure and notes for manual steps when endpoints are not straightforward.

---

### 4. Preliminary Results (High-Level)

All numbers below are **engine outputs under shared, approximate assumptions**; they are meant to illustrate orders of magnitude, not provide precise estimates.

- **Global scale of packages (illustrative)**:
  - In the global context, some packages generate effective resources (money + volunteer value) on the order of:
    - Hundreds of billions to multiple trillions of USD-equivalent per year.
  - In the simple DALY model, this translates into:
    - Tens of thousands to hundreds of thousands of millions of DALYs-equivalent (depending on package and cost-effectiveness assumptions).

- **Country-level examples (MEX, IND, NGA)**:
  - For each of Mexico, India, and Nigeria, the engine computes:
    - Money mobilized per package (e.g., tens of billions of USD/year for Angels-lite in MEX, hundreds of billions in IND).
    - Volunteer-equivalent value.
    - DALYs-equivalent impact per package.
  - The exact numbers depend on:
    - GDP per capita and population.
    - Package parameterization.
    - Cost-effectiveness assumptions.

- **Global package comparison**:
  - Using `global_package_results.csv`, a simple summary chart shows:
    - Which packages generate the most DALYs-equivalent globally (under current assumptions).
    - Typically, packages that combine large monetary flows (wealth pledges, corporate shares) with high EA targeting and effective causes dominate.

These results are **preliminary** because:

- Cause-specific DALY values are still coarse and not yet tailored by region or disease burden.
- Feasibility constraints (e.g., how much tax or pledging is politically realistic) are not yet applied.
- Equity metrics (who benefits) are not yet computed.

---

### 5. Next Planned Steps (High-Level)

The next major improvements planned (and partially outlined as TODO items) are:

- **Cause-specific data refinement**:
  - Replace the generic DALY values for causes with:
    - Region- and cause-specific numbers from WHO-CHOICE, IHME, and EA/GiveWell analyses.
  - Add an applicability matrix (which causes make sense in which countries).

- **Equity/distribution modeling**:
  - Track, for each package and country:
    - Domestic vs foreign beneficiaries.
    - Shares accruing to the global poor vs richer groups.
    - Present vs future benefits (especially for climate and education).
  - Store these metrics in extended global results CSVs.

- **Feasibility and scenario realism**:
  - Introduce simple caps per region on:
    - Tax changes.
    - Participation rates in pledges.
    - Corporate and billionaire giving.
  - Generate “ideal” and “feasible” versions of each package for comparison.

- **Interface and reporting**:
  - Add a small CLI/notebook front-end for interactive exploration.
  - Generate a global markdown report summarizing patterns and highlighting:
    - Which packages look most impactful under different ethical and feasibility lenses.
    - How different country types (high-income, middle-income, low-income) compare.

This document will evolve as the project advances and as we plug in higher-fidelity data and models. For now, it captures the **aims**, **current state**, **methods**, and **first rough results** of the ongoing altruism mega-study.


