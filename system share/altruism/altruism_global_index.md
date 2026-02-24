## Global Altruism Atlas – Index

### 1. What This Atlas Contains

This folder now holds an **atlas of country-level altruism appendices**, one per ISO3 country code, generated and partially filled by the mega-study engine:

- Files are named `altruism_country_XXX.md`, where `XXX` is the ISO3 code (e.g. `USA`, `MEX`, `IND`).
- Each file currently includes:
  - A **macro context section** based on the latest available World Bank data (population, GDP, GDP per capita).
  - A **first-pass package results section**, summarizing:
    - Total modeled DALYs-equivalent across all standard packages.
    - The currently best-performing package (by DALYs-equivalent) for that country, under generic assumptions.
  - A **To Do** block for qualitative and deeper, country-specific refinement.

### 2. How Country Files Were Generated

- Macro data come from:
  - `macro_worldbank_2000_2023.csv` in the `mega-study/data` folder.
- Package results come from:
  - `global_package_results.csv` in `mega-study/data`, produced by running:
    - `altruism_global_compare.py`.
- Country files were then populated in batches using:
  - `fill_country_batch_1.py` (A–C),
  - `fill_country_batch_2.py` (D–H),
  - `fill_country_batch_3.py` (I–M),
  - `fill_country_batch_4.py` (N–S),
  - `fill_country_batch_5.py` (T–Z).

All impact figures are **illustrative engine outputs**: they’re driven by shared package parameters and a configurable but still simplified cost-effectiveness model. They are not yet detailed program evaluations for each country.

### 3. How to Use and Extend the Atlas

- **For quick comparison**:
  - Open any `altruism_country_XXX.md` file to see the macro snapshot and which package type currently looks strongest in that country under the generic model.

- **For deeper country work**:
  - Add qualitative detail to the country file:
    - State welfare structure, private giving norms, remittances, religious giving, etc.
  - Adjust package parameters and cost-effectiveness assumptions for that country or region in the `mega-study` scripts and data files.
  - Re-run:
    - `altruism_impact.py` / `altruism_global_compare.py` (to refresh results),
    - The relevant `fill_country_batch_*.py` (to update the markdown).

- **For global synthesis**:
  - Use `global_package_results.csv` and the atlas together:
    - The CSV for quantitative cross-country analysis.
    - The markdown files for narrative, context, and country-by-country interpretation.

This index is a guide to the atlas; the real work now is iterative: refine data and assumptions, re-run the engine, and progressively turn each country stub into a rich, high-fidelity chapter in the “most comprehensive altruism study” you want to build.


