Title: Proof‑of‑Care Corridor — AR Scene Description
Version: 1.0
Purpose: Guided, safe, supervised corridor interactions with real recipients; outcome capture and ledger publishing.

Scene Summary
You stand at the corridor threshold. AR augments real space with trust overlays, consent states, task lanes, and live telemetry. The system guides mentors, contributors, and recipients through consent, task execution, verification, and publishing—with dual‑lane safety visible at every step.

Environment & Anchors
- Physical anchors:
  - Doorframe Anchor: “CORRIDOR C” label; entry beacon shows state (OPEN/SUPERVISED/SEALED).
  - Consent Pedestal: waist‑high console with two physical buttons mirrored in AR (Recipient Consent, Corridor Supervisor Enable).
  - Mentor Table: tool tray recognized by fiducial markers; AR binds checklists and SOPs above tools.
  - Outcome Wall: projection zone for Proof‑of‑Care ribbons and prior case links.
- Spatial zones (AR delineation as translucent planes with labels):
  - Intake Zone (blue): identity, role, oath reaffirmation.
  - Practice Zone (green): competence‑gated tasks; simulation mode toggle if “open” lane is inactive.
  - Supervision Zone (gold): mentor present required; screen‑record indicator visible.
  - Publishing Zone (white): outcome entry, anonymization, verification routing.

Roles & Permissions (UI Badges)
- Recipient (heart icon): can consent/revoke; sees simple language prompts; can request pause.
- Contributor (hand icon): sees stepwise SOPs, risk flags, mentor chat; cannot proceed if supervision required and absent.
- Mentor (shield icon): can unlock steps, annotate errors, fast‑fail unsafe trajectories.
- Auditor (eye icon): can view recordings, comment on process deviations; cannot modify outcomes.

Core UI Layers
1) Consent Layer (always on in Intake Zone)
   - Prompt cards (large text + voice): “Do you agree to try X?” with quick summary, risks, alternatives.
   - Dual confirmation: Recipient → Supervisor (visual handshake animation). Timestamped.
   - Revocation gesture: recipient raises hand palm‑out; corridor flips to PAUSE (red halo), logs reason.
2) Task Layer (Practice/Supervision Zones)
   - SOP stack (cards left; swipe/voice “next”): step text, micro‑video if available, timers, required signals (“say your intent” prompt).
   - Risk markers: red chevrons on objects; hover for why/risk/back‑out path.
   - Mentor pointer: colored ray + breadcrumb dots; “watch my hands” picture‑in‑picture.
3) Outcome Layer (Publishing Zone)
   - Minimal assertion composer:
     - “We attempted [task], on [pattern/class], observed [effect], for [duration].”
     - Attachments: photo/clip (blurred by default), sensor traces, third‑party confirmations.
   - Verification routes (toggle): recipient self‑verify; mentor co‑sign; external clinic signoff.
   - Privacy slider: fully public → pseudonymous → restricted (requires reason, logs access policy).
4) Ledger Preview (Outcome Wall)
   - Ribbon render: patient‑years saved estimate, confidence, review window.
   - Related cases (blob‑class similarity): “People like this: links to 3–5 prior outcomes.”
   - Bounty linkage: milestones struck; residual bounties suggested.

Dual‑Lane Safety
- Supervised Lane: gold footer bar with mentor presence light; any step without mentor pauses flow.
- Open Lane (experimentation): purple footer; only for non‑recipient‑impact tasks (simulated, phantom patients, bench work). Publishing automatically tagged ‘open’ and excluded from certain leaderboards.

Interactions
- Voice: “next step”, “explain risk”, “pause corridor”, “call mentor”, “publish draft”, “anonymize faces”.
- Gestures: pinch to pin SOP card; palm‑out to pause; two‑finger circle to rewind last 10s of mentor cam.
- Gaze + dwell: highlight instrument; tooltip with verification checklist appears.

State Machine (High‑Level)
- IDLE → INTAKE (consent pending) → PRACTICE (open) / SUPERVISION (mentor) → INCIDENT|PAUSE|COMPLETE
  - INCIDENT opens Incident Panel: tag severity; immediate safe‑exit checklist; required debrief card.
  - COMPLETE routes to Publishing → Preview → Submit → Ledger Entry (with verification status).

Data Capture & Privacy
- Streams: mentor cam, instrument cam, ambient decibel, timers, SOP step timestamps.
- Defaults: no faces stored; automatic blur; explicit opt‑in to show faces; on‑device transient storage until publish.
- Recipient control: “hide my face”, “mask my voice”, “revoke recording”; revocation respected in all previews and ledger public assets.

Trust & Reputation UI
- Contributor card: recent trust delta, last 5 outcomes, unresolved incidents (count only), badges (e.g., “No Harm 120d”).
- Mentor card: supervision hours, trainees uplifted, false‑positive/negative incident balance.
- Corridor card: throughput, average time‑to‑first‑care, safety score (rolling window).

Error & Risk Handling
- Soft fail: orange border; suggestions panel offers remedial path or “swap to simulation”. Logged but not an incident.
- Hard fail: red border; flow locks; mentor override OR safe‑exit protocol (countdown + checklist). Publishing requires incident narrative.

Performance Targets (visual hints)
- Time‑to‑consent: ≤ 90s (readability score > 70).
- Time‑to‑first‑care: ≤ 15 min for predefined tasks.
- Publishing friction: draft in ≤ 180s; submit in ≤ 300s including attachments.

Accessibility
- Large‑type mode; audio narration for all prompts; color‑blind safe palette; haptic cues for critical state changes.

Scene Assets (suggested)
- Icons: heart (recipient), hand (contributor), shield (mentor), eye (auditor), ribbon (ledger), gavel (bounty).
- Sounds: soft chime (step complete), low bell (consent), woodblock (pause), string swell (publish).

Demo Script (3 minutes)
1) Entry: corridor beacon shows SUPERVISED; you see role badges (you: contributor).
2) Consent: recipient and supervisor confirm; PAUSE gesture demo; resume.
3) Task: pipette SOP; mentor pointer shows angle; risk tooltip explains contamination vector.
4) Outcome: compose minimal assertion; attach blurred clip; pick recipient self‑verify + mentor co‑sign.
5) Ledger: ribbon appears on wall; similar cases float; bounty milestone strikes; applause sting optional.

Notes for Builders
- Log every pause and reason; pauses correlate with outcome quality—surface to mentors.
- Keep consent language at CEFR B1; provide “more detail” popovers for advanced users.
- Auto‑generate draft outcomes from captured data to reduce typing; require human confirmation.




