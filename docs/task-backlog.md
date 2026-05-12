# MoonTurtle task backlog

This backlog translates the product brief, PRD, and Phase 1 build contract into executable work. Keep tasks small, testable, and tied to the reading-first product loop.

Status key:

- `[ ]` not started or not verified
- `[~]` implemented or partially implemented, needs verification
- `[x]` verified complete

## Epic 1: Product docs and alignment

- `[x]` Add product brief.
- `[x]` Add PRD.
- `[x]` Add JTBD and user stories.
- `[x]` Add backlog and docs index.
- `[ ]` Refresh stale phase-history language in `README.md`, `GETTING_STARTED.md`, and `docs/plan.md`.
- `[ ]` Add a short decision log for true-sky boundary convention, provider strategy, and local-first privacy.
- `[ ]` Add release plan once the first practitioner cohort is known.

Done when:

- A fresh agent can understand the product before reading implementation specs.
- Strategy docs and implementation contracts do not contradict each other.

## Epic 2: Deterministic astronomy

- `[~]` Verify `computeNatal(user)` against Tyler and Ali fixtures.
- `[~]` Verify `computeSky({ place, timeZone })` against public Moon phase and rise/set sources for one fixed timestamp.
- `[~]` Verify IAU zodiac boundary table includes all 13 signs including Ophiuchus.
- `[ ]` Add repeatable tests or scripts for seed-user astronomy regression.
- `[ ]` Document tolerance thresholds for longitude, phase, and rise/set comparisons.
- `[ ]` Confirm no tropical labels leak into domain or UI output.

Done when:

- Tyler and Ali expected placements pass.
- Unknown birth time removes angles, houses, and chart-ruler claims.
- Boundary convention is reproducible and documented.

## Epic 3: Signal ranking

- `[~]` Verify top signals are ranked before reading generation.
- `[ ]` Add tests for aspect tightness, angle removal when birth time unknown, and station/ingress boosts.
- `[ ]` Confirm activations derive from ranked signals rather than raw chart enumeration.
- `[ ]` Add debug-friendly signal reasons for Method or development output if useful.

Done when:

- The app consistently selects one to three loudest signals.
- Ranking is deterministic for the same chart, sky, and timestamp.

## Epic 4: Onboarding and local storage

- `[~]` Verify onboarding stores user data with schema version and birth hash.
- `[~]` Verify geocoding and timezone fallbacks.
- `[ ]` Test permission denied path on mobile-sized viewport.
- `[ ]` Test malformed localStorage recovery.
- `[ ]` Confirm raw birth data never leaves the browser.
- `[ ]` Add manual-location fallback polish if current UI blocks real users.

Done when:

- A user can complete setup without device location permission.
- Bad storage, failed geocoding, and timezone ambiguity have recoverable paths.

## Epic 5: Reading generation and fallback

- `[~]` Verify generated reading schema exactly matches UI requirements.
- `[~]` Verify cache keys distinguish birth hash, local date, and AI mode.
- `[~]` Verify local fallback mode is honest and useful.
- `[ ]` Add provider failure tests for invalid key, network error, malformed JSON, and schema count mismatch.
- `[ ]` Add forbidden-word and exemplar-bleed checks.
- `[ ]` Confirm cache invalidation when source metadata version changes.

Done when:

- AI success, AI failure, and local-only mode all produce stable UI states.
- Invalid generated prose never displays as if it were valid.

## Epic 6: Today experience

- `[~]` Verify Today leads with primary reading and follows the design order.
- `[ ]` Check mobile layout at 390-430px for every loading and fallback state.
- `[ ]` Confirm all labels and CTAs stay calm, nonfatalistic, and non-gamified.
- `[ ]` Review generated and local fallback copy against voice rules.

Done when:

- Today feels like the primary product, not a dashboard.
- Receipts are accessible but secondary.

## Epic 7: Sky, Natal, Journal, and Method

- `[~]` Verify Sky displays current Moon, Sun, phase, illumination, rise/set, and method.
- `[~]` Verify Natal hides uncomputable time-sensitive data.
- `[~]` Verify Journal uses local entries without streaks or pressure language.
- `[~]` Verify Method explains astronomy, interpretation, privacy, and provider settings.
- `[ ]` Tighten copy where it reads as a technical manual or disclaimer wall.
- `[ ]` Add chart wheel only after core reading loop passes release checks.

Done when:

- Supporting screens increase trust without overtaking Today.

## Epic 8: PWA and deployment

- `[~]` Verify manifest file path and app metadata.
- `[ ]` Add or verify service worker behavior for cached reading visibility.
- `[ ]` Run Cloudflare Pages preview with Worker API.
- `[ ]` Document environment variables for hosted and local BYO modes.
- `[ ]` Add production rollback steps.

Done when:

- Soft-launch users can open the hosted app and receive readings.
- Offline or provider failures degrade clearly.

## Epic 9: QA and release readiness

- `[ ]` Run `npm run build`.
- `[ ]` Run `npm audit --audit-level=moderate`.
- `[ ]` Complete `docs/testing-checklist.md`.
- `[ ]` Manually test onboarding, Today, Sky, Natal, Journal, Method, settings, and local reset.
- `[ ]` Inspect `/api/reading` request payloads for privacy compliance.
- `[ ]` Capture release notes and known limitations.

Done when:

- There are no known P0 bugs.
- Remaining risks are documented in release notes.

## Better options to consider

- Add a tiny regression script before adding a full test framework. The deterministic astronomy and schema checks may be enough for soft launch.
- Use a `decision-log.md` before creating a large roadmap. MoonTurtle's risk is drift, not lack of ideas.
- Treat practitioner feedback as structured themes first, not as feature requests. The product will get noisy quickly if every resonance note becomes a screen.
