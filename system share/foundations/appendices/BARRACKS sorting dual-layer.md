# BARRACKS Sorting Dual-Layer (Azure TRUTH × Crimson TASTE)

*Reference spec for assigning residents inside zero-cost BARRACKS networks.*

---

## Overview

Every BARRACKS facility uses a two-sided matching loop inspired by `45 Lewontins Fallacy and Antifallacy - The Infinite-Dimensional Reality of Human Difference.md`:

- **Azure (TRUTH) scoring** — objective facility metrics:
  - Hygiene / cleanliness checks
  - Damage reports, repair logs, punctuality for shifts
  - Conflict incidents, restorative actions taken
  - Domain contribution (build, maintain, coordinate)
- **Crimson (TASTE) selection** — resident preference layer:
  - Within the bands their Azure score unlocks, residents pick bunkrooms they want
  - Flag “never again” pairings; highlight people they thrive beside
  - Request reshuffles after conflicts, life changes, or new domain duties

This keeps complementary inequality intact: responsible crews climb toward hotel-grade suites; chaotic newcomers share rugged pods until they improve. Nobody is stuck with intolerable roommates because of one deficit—the TASTE layer lets them signal preferences across the remaining dimensions.

---

## Process Flow

1. **Daily ingestion** of facility telemetry → Azure score per resident (0–100).
2. **Lobby presentation**:
   - Tiers unlocked by Azure score (e.g., <40 rugged, 40–70 standard, ≥70 premium).
   - Available rooms listed with metadata (temperament mix, noise level, shift cadence).
3. **Resident selection**:
   - Pick preferred room among unlocked tiers.
   - Submit avoidance flags / preference weights.
4. **Matching engine** (human or software):
   - Respects Azure gating, maximizes complementary strengths, minimizes conflicts.
   - Resolves collisions with priority rules (tenure, contribution, restorative justice outcomes).
5. **Move & audit**:
   - Residents relocate; staff confirm condition of vacated rooms.
   - Azure scores update next cycle reflecting behaviour in new context.

Reshuffles run **daily**, or on-demand when significant events occur (injury, new child arrival, major project forming).

---

## Integration Points

- `23__pilots.md` – Pilot 1 must include Sorting Hat lobby infrastructure.
- `23__solutions.md` – Phase 1 build-out references this spec when describing BARRACKS.
- `guides/barracks-tokens-stake-in-what-you-build.guide.js` – “Sorting Hat for BARRACKS” section matches this blueprint.
- `guides/welfare-recipients-are-conduits-not-recipients.guide.js` – Azure/TRUTH vs Crimson/TASTE narrative points here for details.
- `guides/how-do-children-access-the-lobby.guide.js` – Uses same mechanic for Neverland exit destinations.

---

## Principles

- **No one bottoms-out permanently**: even lowest Azure scorers can climb via restorative chores, mentoring, or consistent reliability.
- **Complementary inequality**: bunkrooms are curated parties (no five identical “rogues”); everyone hears “that’s your strength.”
- **Infinite-dimensional respect**: Azure captures objective facility needs; Crimson lets residents express the countless subjective dimensions Lewontin’s Antifallacy highlights.

---

For revisions, update this spec and link from any document that references BARRACKS accommodations. Use this file as the canonical source for TRUTH/TASTE sorting expectations.

