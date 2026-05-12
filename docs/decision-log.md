# MoonTurtle decision log

Short product and architecture decisions that should prevent soft-launch drift.

## 2026-05-12 - v1 stays focused on daily true-sky readings

Decision:

- MoonTurtle v1 is a focused daily true-sky reading app, not a multi-system symbolic profile platform.
- The v1 loop is birth data plus current sky -> deterministic astronomy -> deterministic signal ranking -> cached MoonTurtle-voice reading -> calm receipts and journal continuity.
- Human Design, The Pattern-style profiling, synastry, tarot, long-form 25-part readings, chart wheel, push notifications, analytics, accounts, payments, and cloud sync are Phase 2+.

Why:

- The reading is the product. Extra systems are only useful after the daily reading loop is trusted.
- Practitioners need receipts and method clarity before breadth.
- The v1 brand promise depends on restraint: meaningful enough to contemplate, never absolute enough to obey.

Rejected alternatives:

- Multi-system profile synthesis in v1. Rejected because it would dilute the true-sky reading loop and increase voice drift risk.
- The Pattern-style emotional profiling in v1. Rejected because MoonTurtle's wedge is emotional specificity plus transparent receipts, not opaque personality labeling.

## 2026-05-12 - True-sky convention remains open and reproducible

Decision:

- Physical bodies use true-sky sidereal via observer-based sky position and IAU constellation containment.
- Ecliptic points such as nodes, angles, and houses use MoonTurtle's documented IAU ecliptic-boundary fallback.
- Mastering The Zodiac can be referenced as a neighboring true-sky astrology approach, but MoonTurtle must not claim to use MTZ's midpoint boundary method.

Why:

- "Actual sky" means the sky direction from a real observer at a real time, not only a longitude bin.
- IAU constellation lookup is open, testable, and bundled through `astronomy-engine`.
- Ophiuchus appears because the body is in that sky region, not as a gimmick.

Rejected alternatives:

- Tropical fallback. Rejected because it breaks the product promise.
- Equal 30-degree sidereal labels. Rejected because the master prompt and app docs require unequal visible-sky constellations.
- Copying MTZ midpoint boundary data. Rejected because MoonTurtle needs an auditable, ownable convention and a clearer astronomy/astrology distinction.

## 2026-05-12 - AI writes prose only

Decision:

- Astronomy, timezone handling, true-sky sign assignment, signal ranking, privacy filtering, cache identity, and schema validation are deterministic.
- AI receives calculated chart/current-sky/signal receipts and writes prose from them.
- Generated readings must pass exact schema, voice, and exemplar-bleed validation before display.

Why:

- The model should not decide what is astronomically true or what signal is loudest.
- Deterministic receipts make the reading auditable and reduce generic horoscope drift.
- Invalid prose should fail into a clearly marked local fallback, not display as if it were valid.

Rejected alternatives:

- Sending raw birth details to the model. Rejected for v1 privacy.
- Asking the model to calculate or discover transits. Rejected because deterministic signal ranking is part of the product's trust contract.
