## Matchmaking Altruism Triads – Capacity, Need, and Positive-Sum Pairings

> **Status**: First-pass scaffold of a “pairing engine” between countries/clusters with surplus altruistic capacity and those with concentrated CESET needs.

---

### 1. Purpose

- Move from **descriptive atlas** to **prescriptive match-making**:
  - Identify where *surplus* (wealth, tax base, AUM, religous-giving capacity, technical expertise) exists.
  - Identify where *need* (CESET burden) is most acute by cause-area.
  - Propose **Triads** and inter-country arrangements that:
    - Are *positive-sum*.
    - Respect cultural/religious constraints.
    - Are realistic enough to be implementation targets later.

---

### 2. Capacity vs Need – Simple Vectors

For each country/cluster we define:

- **Capacity vector C** (dimensions indicative):
  - `C_fiscal`: fiscal space / ability to commit public resources.
  - `C_private`: private wealth & philanthropy capacity.
  - `C_financial_hub`: AUM / offshore role.
  - `C_religious_altruism`: scale of tithing/zakat-style giving.
  - `C_technical`: scientific/technical capacity (e.g. aging research, health systems).
- **Need vector N** (CESET-oriented):
  - `N_child`: under‑5 mortality and stunting.
  - `N_communicable`: HIV, TB, malaria, other infectious disease.
  - `N_NCD`: cardiovascular, cancer, diabetes.
  - `N_conflict`: direct violence/war.
  - `N_climate`: exposure to climate risk (heat, sea-level, cyclones, droughts).

**Donor/lever clusters**: high C, relatively low N in some dimensions.
**Recipient clusters**: high N, low C.

---

### 3. Example Capacity Clusters

#### 3.1 High-income welfare/OECD donors

- **Examples**: US, CA, DE, FR, UK, SE, NL, CH, JP, AU/NZ (when added).
- Strengths:
  - High `C_fiscal`, `C_private`, `C_technical`.
  - Increasing (but still modest) `C_ODA`.
- Typical N:
  - High `N_NCD`, low `N_child`, low classic `N_communicable`.

#### 3.2 Tax havens & financial hubs

- **Examples**: CH, LU, SG, BZ, PA, SC, KY, MC.
- Strengths:
  - Very high `C_financial_hub` (AUM).
  - Often high `C_private`.
- Typical N:
  - Very low `N_child` and `N_communicable`, moderate `N_NCD`.

#### 3.3 Zakat / religious-giving giants

- **Examples**: ID, PK, BD, SA, AE, EG, MA, DZ, TN, TR.
- Strengths:
  - Large `C_religious_altruism` (zakat, sadaqah).
  - Deep local legitimacy for religiously framed altruism.
- Typical N:
  - Mixed: some (BD/PK) still have high `N_child`; others (Gulf) low N but high capacity.

#### 3.4 Emerging economies with large surplus capacity

- **Examples**: CN, IN, BR, MX, AR, CL, CO, PE, ZA.
- Strengths:
  - Growing `C_fiscal`, `C_private`, `C_technical`.
  - Regional leadership potential.
- N:
  - Moderate `N_child`, rising `N_NCD`.

---

### 4. Example High-Need Clusters

Using OWID/WHO data (see `altruism_cause_areas.md` and country files):

- **Sahel & West African high-mortality belt**:
  - NE, ML, TD, BF, CI, SL, LR, GM.
  - Very high `N_child`, `N_communicable`, rising `N_climate`.
- **Horn + Upper Nile conflict belt**:
  - SO, ET, SD, SS, ER, DJ, parts of KE/TZ.
  - High `N_child`, `N_conflict`, `N_climate`.
- **DRC & Great Lakes**:
  - CD, RW, UG, BI (Burundi to be added).
  - High `N_child`, `N_conflict`, `N_communicable`.
- **Southern Africa HIV/high NCD transition**:
  - ZA, BW, NA, LS, SZ, ZM, ZW, MW, MZ.
  - High `N_HIV`, moderate `N_child`, rising `N_NCD`.
- **Fragile states elsewhere**:
  - AF, HT, VE, Yemen/Syria (to be added).

---

### 5. Matchmaking Patterns – Illustrative Triads

#### 5.1 Oil / minerals → child survival & climate resilience

- **Capacity**:
  - Oil & mining states: NO, SA, AE, AO, NG, KZ, CA, US/CA state-level, etc.
  - High `C_fiscal` & potential for `C_private`.
- **Need**:
  - Sahel & Horn high-mortality belt (NE, ML, TD, BF, SO, SD, SS, ET, etc.).
- **Triad**: *“Oil-for-Life” Triad cluster*
  - Mechanism:
    - Fixed small fraction of oil/mineral revenue (e.g. 0.5–2%) channeled to:
      - Child survival packages (vaccines, ORS/antibiotics, malaria nets).
      - Climate-resilient food security.
  - Example pairing:
    - **Angola + Norway + Saudi** → **Mozambique, Malawi, Sierra Leone, South Sudan**.
  - Rationale:
    - For donors: reputational and moral dividends, stable supply chains.
    - For recipients: huge reductions in `N_child` and `N_communicable`.

#### 5.2 Tax-hub AUM → global aging & NCD R&D + high-mortality pockets

- **Capacity**:
  - CH, LU, SG, KY, MC, PA, BZ.
  - Very large `C_financial_hub` and `C_private`.
- **Mixed Need**:
  - They themselves have `N_NCD` and aging problems.
- **Triad**: *“Offshore Altruism” Triad*
  - Split their altruistic commitments:
    - 50% → global CESET hotspots (Sahel, DRC, AF, HT).
    - 50% → global public-goods research (aging, cancer, pandemic preparedness).
  - Mechanism:
    - 0.01–0.1% of AUM/year as standard for funds domiciled in these hubs.

#### 5.3 Zakat flows → Horn + Sahel

- **Capacity**:
  - ID, PK, BD, SA, AE, EG, MA, DZ, TN, TR.
  - High `C_religious_altruism`.
- **Need**:
  - SO, SD, SS, NE, ML, TD, BF – high `N_child`, `N_conflict`, `N_climate`.
- **Triad**: *“Ummah Child & Famine Relief” Triad*
  - Mechanism:
    - Develop zakat-compliant funds that:
      - Prioritize life-saving interventions (food, health).
      - Are transparent and track CESET reduction.
  - Example pairing:
    - **Saudi/UAE/EG/PK/ID zakat** → **Somalia, South Sudan, Niger, Mali, Chad**.

#### 5.4 Diaspora → targeted reconstruction & stabilization

- **Capacity**:
  - Diasporas from AF, HT, VE, CD, SY, etc.
  - Already sending billions in remittances.
- **Need**:
  - Fragile states with broken state capacity.
- **Triad**: *“Diaspora-Optimized Remittance Triad”*
  - Mechanism:
    - Voluntary overlay on remittances (e.g. +1–3%) into pooled funds.
    - Funds used for:
      - Local health/education micro-grants.
      - Infrastructure that reduces CESETs.

---

### 6. Worked Example – Oil-for-Life Triad (Quantified Sketch)

This section provides a first numerical sketch for the Oil-for-Life pattern, to illustrate scale and methodology.

#### 6.1 Donor side – Angola + Norway + Saudi Arabia (illustrative)

Approximate annual oil-related revenues\*:

- Angola (AO): ~USD 20B/year.
- Norway (NO): ~USD 50B/year.
- Saudi Arabia (SA): ~USD 200B/year.

Total oil revenue for this triad:

\[
R_{\text{oil,triad}} \approx 270\text{B USD/year}^*
\]

Assuming a **1% commitment** of oil revenues to Oil-for-Life:

\[
R_{\text{OFL}} = 0.01 \cdot 270\text{B} \approx 2.7\text{B USD/year}
\]

#### 6.2 Recipient side – Mozambique, Malawi, Sierra Leone, South Sudan

From country deep dives and JSONs:

- Approximate under‑5 deaths/year (very rough, pre‑COVID order-of-magnitude)\*:
  - Mozambique (MZ): ~70k–90k.
  - Malawi (MW): ~40k–60k.
  - Sierra Leone (SL): ~30k–40k.
  - South Sudan (SS): ~30k–40k.
- Combined under‑5 deaths:

\[
L_{u5,\text{cluster}} \approx 170k–230k\text{ deaths/year}^*
\]

Cost per under‑5 life saved via top-tier interventions:

- Use a conservative band: **USD 5,000–10,000 per life saved**\*.

If **all** Oil-for-Life funds are used for child survival in this cluster:

\[
L_{\text{saved}} \approx \frac{R_{\text{OFL}}}{c} = 
\begin{cases}
2.7\text{B} / 5{,}000 = 540{,}000 & (\text{optimistic}) \\
2.7\text{B} / 10{,}000 = 270{,}000 & (\text{conservative})
\end{cases}
\]

This range exceeds the approximate current under‑5 deaths in the chosen cluster (170k–230k). In practice:

- The triad could:
  - Eliminate **most preventable under‑5 deaths** in these four countries.
  - Still leave surplus funds for:
    - Maternal health.
    - Nutrition.
    - Resilience-building (water, agriculture).

This shows:

- Even a **1% levy on oil revenues of just three countries** could, if effectively deployed, plausibly:
  - Bring under‑5 mortality in a small group of high-burden countries close to rich-country levels.
  - Without materially hurting donor states’ fiscal positions.

In a more realistic scenario:

- Only a fraction of the Oil-for-Life funds go to this one cluster.
- The rest are:
  - Spread across other high-need clusters (Sahel, DRC, Yemen, etc.).
  - Or invested in long-term NCD/aging research.

But even then, the *order of magnitude* remains: **small slices of oil wealth → huge CESET reductions**.

---

### 7. Next Steps for This File

- Formalize:
  - Simple numeric indices for `C_*` and `N_*` per country based on existing JSON fields.
- Implement in `altruism_impact.py`:
  - Load all `countries/data/*.json`.
  - Compute capacity/need scores.
  - Suggest top N pairings for each Triad pattern (oil-for-life, offshore altruism, zakat, diaspora).
- Add:
  - Concrete examples with rough USD flows and estimated deaths averted (using cost-per-life-saved bands).
  - Sensitivity analyses (what if only 10% of potential capacity is mobilised?).

This file is meant to host the *conceptual* matchmaking layer; numeric results and plots will live alongside it in scripts and generated figures.

---

*End of current iteration of the matchmaking Triads scaffold (further quantitative examples to be added).* 


