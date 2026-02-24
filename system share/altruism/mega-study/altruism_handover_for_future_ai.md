## Altruism Mega-Study – Handover Guide for Future Work

### 1. Intent and Big Picture

This project is meant to become a **global altruism analysis engine + atlas**, answering questions like:

- “What if individuals and states became much more altruistic?”  
- “How much money/time would that mobilize in each country?”  
- “If directed to specific causes, how much impact (e.g. DALYs-equivalent) could that have?”  
- “Who would benefit (domestic vs foreign, poorest vs others, present vs future)?”  

It combines:

- **Global data** (World Bank, etc.).  
- **Scenario packages** (Angels-lite, Tax & Match, Corporate/Billionaire pledges, Volunteer & Talent Surge, Solidarity Surcharges).  
- **Cause-specific cost-effectiveness assumptions**.  
- **Equity splits** and (later) **feasibility constraints**.  
- A **country atlas** (`altruism_country_XXX.md`) with per-country narratives.

The goal is a living system that can be refined over time as better data and models arrive.

---

### 2. Key Files and What They Do

In `mega-study/`:

- **Core logic**
  - `altruism_packages.py` – defines the main altruism packages and their parameters.  
  - `altruism_impact.py` – core engine:
    - Takes a `Context` (country macro data) + a package.  
    - Computes money and volunteer volumes.  
    - Allocates resources across causes.  
    - Computes DALYs-equivalent by cause and by equity group.
  - `altruism_country_contexts.py` – builds `Context` objects for each country from macro data.  
  - `altruism_causes.py` – loads cause-level cost-effectiveness (`causes_config.csv`) and package cause weights.  
  - `altruism_cost_effectiveness.py` – generic cost-effectiveness defaults (high/moderate/low).  
  - `altruism_equity.py` – defines equity groups (domestic poor/non-poor, foreign poor/non-poor, future) and how each cause splits impact across them.

- **Data acquisition and pipeline**
  - `altruism_data_download.R` – downloads World Bank macro data for all countries and (where possible) OECD SOCX/DAC data, with caching and basic robustness.  
  - `altruism_data_pipeline.R` – builds placeholder macro and social-spending summaries and writes them to CSVs.  
  - `euro_who_api_client.py` – scaffold for querying WHO/Europe health data (needs real dataset codes).

- **Global comparison and outputs**
  - `altruism_global_compare.py` – runs all packages for all countries:
    - Writes `data/global_package_results.csv` with:
      - Country, year, GDP per capita, population.  
      - Package name.  
      - Money_total, volunteer_value.  
      - DALYs_total and DALYs split by equity group.  
    - Produces summary plots (`global_package_dalys_summary.*`).

- **Country atlas tools**
  - `generate_country_stubs.py` – creates `altruism_country_XXX.md` stubs for all ISO3 codes.  
  - `fill_country_batch_1..5.py` – fill country files in A–C, D–H, I–M, N–S, T–Z batches with:
    - Macro context from WB data.  
    - First-pass package results from `global_package_results.csv`.

- **Documentation**
  - `altruism-mega-appendix.md` – conceptual/mathematical backbone.  
  - `altruism_global_index.md` – describes the global atlas and how country files were generated.  
  - `altruism_work_in_progress.md` – a snapshot of aims, current implementation, methods, and preliminary results.  
  - `altruism_handover_for_future_ai.md` (this file) – road map for future continuation.

In `mega-study/data/`:

- `macro_worldbank_2000_2023.csv` – macro data for all countries.  
- `global_package_results.csv` – current global run of all packages × countries (with equity splits).  
- `causes_config.csv` – cause-level DALYs per 1,000 USD and notes (currently approximate).  
- `equity_config.csv` – baseline equity shares for groups.  
- Various placeholder CSVs for social spending and private giving.

In `countries/`:

- `altruism_country_XXX.md` – one per ISO3 country, with:
  - Macro context.  
  - First-pass package results.  
  - TODOs and, for some countries, interpretive notes.

---

### 3. How to Re-run the Engine (Minimal Steps)

From `C:\solve` (or project root) in PowerShell:

1. **(Optional) Refresh macro data**  
   ```powershell
   & 'C:\Program Files\R\R-4.5.2\bin\Rscript.exe' "system share\appendices\altruism\mega-study\altruism_data_download.R"
   ```
   - Skips re-download if files already exist.

2. **Rebuild placeholder summaries (if needed)**  
   ```powershell
   & 'C:\Program Files\R\R-4.5.2\bin\Rscript.exe' "system share\appendices\altruism\mega-study\altruism_data_pipeline.R"
   ```

3. **Run the impact engine for test contexts**  
   ```powershell
   python "system share\appendices\altruism\mega-study\altruism_impact.py"
   ```

4. **Generate global results and plots**  
   ```powershell
   python "system share\appendices\altruism\mega-study\altruism_global_compare.py"
   ```
   - This refreshes `global_package_results.csv` and summary plots.

5. **Refresh country files (if macros changed)**  
   ```powershell
   python "system share\appendices\altruism\mega-study\fill_country_batch_1.py"
   python "system share\appendices\altruism\mega-study\fill_country_batch_2.py"
   python "system share\appendices\altruism\mega-study\fill_country_batch_3.py"
   python "system share\appendices\altruism\mega-study\fill_country_batch_4.py"
   python "system share\appendices\altruism\mega-study\fill_country_batch_5.py"
   ```

---

### 4. What’s Already Done vs. What’s Left

**Done (usable today):**

- Global macro data ingested for all countries.  
- Package + cause + equity engine implemented and running.  
- Global package comparison CSV + DALY summary plot generated.  
- Country atlas files generated and filled with:
  - Macro context and first-pass package results for all countries.  
  - Deeper interpretive notes for a subset (e.g., Mexico, several Horn/Nile/Lake Victoria countries, India, Bangladesh, Norway, Nigeria).

**Partially done / scaffolded:**

- Cause-specific cost-effectiveness (`causes_config.csv`) – structure is there, numbers are approximate.  
- Equity splits (`equity_config.csv` + `altruism_equity.py`) – heuristics by cause, not yet tailored per region or country.  
- WHO/Europe API client (`euro_who_api_client.py`) – basic skeleton, needs real dataset codes and use cases.

**Not yet done (high-value next steps):**

1. **Refine cause data per region/country**
   - For key causes (e.g., malaria, TB, deworming, cash transfers, maternal/child health, NCDs, climate, education):
     - Pull cost-effectiveness estimates from:
       - WHO‑CHOICE, IHME, GiveWell/EA models, and specific intervention studies.  
     - Replace the DALY-per-1,000-USD values in `causes_config.csv` with ranges and citations.  
   - Optionally add a cause applicability matrix (which interventions make sense in which countries).

2. **Refine equity and add feasibility**
   - Equity:
     - Use poverty and benefit-incidence data (World Bank WDI/PovcalNet, OECD, etc.) to adjust equity splits per region/income group.  
     - Eventually store equity parameters per region/country rather than globally.  
   - Feasibility:
     - Introduce caps per income group/region on:
       - Tax changes.  
       - Pledge rates and participation.  
       - Corporate and billionaire giving shares.  
     - Modify package evaluation to output “ideal” and “feasible” versions.

3. **Deepen selected country chapters**
   - Pick a small focus set (e.g., Mexico, India, Bangladesh, Kenya, Nigeria, Norway, one low-income African country) and:
     - Add real data on:
       - Social spending by function (health, education, welfare).  
       - ODA (as donor and/or recipient).  
       - Private philanthropy and remittances.  
       - Disease and education indicators.  
     - Tune:
       - Package parameters.  
       - Cause weights and cost-effectiveness entries.  
       - Equity splits.

4. **Interactive interface**
   - Build a small CLI or Jupyter notebook which:
     - Lets a user pick a country.  
     - Tweaks key parameters (pledge rate, EA targeting share, cause mix).  
     - Shows updated volumes, DALYs, and equity splits immediately.

5. **Full narrative report**
   - Expand `altruism_work_in_progress.md` into a multi-part report:
     - Part I – Global logic, scenarios, and methodology.  
     - Part II – Selected country deep dives.  
     - Part III – Package and scenario comparisons under different ethical/feasibility lenses.

---

### 5. How a Future AI Can Continue

If a “fresh AI” picks up this project later, a productive order of operations would be:

1. **Re-familiarize with the structure**
   - Read:
     - `altruism-mega-appendix.md` – conceptual backbone.  
     - `altruism_work_in_progress.md` – where things stood at the time of this handover.  
     - `altruism_global_index.md` – overview of the atlas.

2. **Verify the engine still runs**
   - Run the commands in Section 3 to ensure scripts still work in the environment.

3. **Choose a focus**
   - Either:
     - **Data refinement**: focus on a few causes and regions and upgrade `causes_config.csv` and `equity_config.csv`.  
     - **Country refinement**: focus on a small set of countries, improve their data and narratives.  
     - **Interface/report**: build human-facing tools and narratives on top of the existing engine.

4. **Iterate and document**
   - Each time new pieces are added (e.g., better cause data for malaria in East Africa, or a refined Norway donor profile), update:
     - The relevant CSVs or configs.  
     - The corresponding country files.  
     - This handover or `altruism_work_in_progress.md` to record what changed.

The heavy lifting of building the scaffolding is done; the remaining work is mostly about **feeding the engine better data and writing better stories** about what the scenarios imply for each country and for the world as a whole.


