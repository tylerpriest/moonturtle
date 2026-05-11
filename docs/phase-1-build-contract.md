# Phase 1 build contract

This is the contract for turning MoonTurtle from static prototype into soft-launch product.

If a task is not in this contract, treat it as Phase 2+ unless the user explicitly changes scope.

## Goal

Phase 1 ships this loop:

```text
birth data + current location
  -> deterministic astronomy
  -> deterministic loudest-signal ranking
  -> cached AI prose in MoonTurtle voice
  -> Today/Sky/Natal/Journal/Method screens using live data
```

The app should work for a real practitioner with one device, no account, no payment, and no cloud sync.

## Build order

1. **Domain schema**  
   Add `src/domain/schema.js`. Define the shapes for `BirthInput`, `Place`, `NatalChart`, `CurrentSky`, `Signal`, `ReadingProse`, and app-level errors.

2. **Astronomy**  
   Add `src/domain/astronomy.js` and the boundary generator for `src/domain/zodiac-boundaries.json`. Follow `docs/astronomy-spec.md`.

3. **Signal ranking**  
   Add deterministic ranking before any AI call. Follow `docs/signal-ranking.md`.

4. **Storage/io**  
   Add `src/io/storage.js`, `src/io/geocoding.js`, and `src/io/timezone.js`. Follow `docs/data-privacy-storage.md`.

5. **Onboarding**  
   Replace static fields with controlled native inputs. Save only local data. Geocoding failures must degrade to manual entry.

6. **Reading orchestration**  
   Add `src/reading/cache.js`, `src/reading/generate.js`, and `src/reading/useReading.js`. The hook owns astronomy -> signals -> cache -> API -> merged reading.

7. **Worker/API**  
   Add `functions/api/reading.js`. The Worker receives computed chart/current-sky/signals, not raw birth data.

8. **UI wiring**  
   Wire all screens to `useReading()`. Keep static seed data only as fixtures and exemplars.

9. **PWA scaffold**  
   Add manifest/service worker only after the live app path works.

10. **Final verification**  
   Run `docs/testing-checklist.md` end-to-end.

## In scope

- Any birth date/time/place with known or manually entered coordinates.
- Current sky for the user's current/manual location.
- True-sky sidereal signs via MoonTurtle's IAU first-crossing convention.
- Placidus houses if birth time is known.
- Unknown birth time fallback that avoids Ascendant, Midheaven, and houses.
- Daily reading with exact schema from `src/reading/prompt/04-schema.md`.
- Local daily reading cache.
- Lightweight local journal history.
- Cloudflare Pages/Functions deployment path.
- BYO/local model proxy support via `scripts/dev-byo.sh`.

## Out of scope

- User accounts, auth, cloud sync, teams, payments, analytics.
- Push notifications.
- Social sharing.
- Long-form 25-part reading UI.
- Multi-system profile reading.
- Synastry.
- Named 13-Moon Calendar layer.
- Chart wheel rendering, unless all core live-data work is already complete.
- Native mobile app wrappers.

## Module boundaries

- `src/domain/*` is pure and deterministic. No React, network, localStorage, or provider code.
- `src/io/*` touches browser/platform APIs and external lookup services.
- `src/reading/*` orchestrates astronomy, signals, cache, and provider calls.
- `src/providers/*` adapts model providers behind one interface.
- `src/ui/*` renders state and calls hooks. Screens should not know about provider APIs or ephemeris details.
- `functions/api/*` validates and generates prose. It should not receive raw birth data.

## Dependency rules

- Prefer open, auditable packages with permissive licenses.
- Re-check `docs/open-source-astrology-tools.md` before adding astrology math packages.
- Do not use package zodiac labels as MoonTurtle true-sky sign truth unless they come from our IAU boundary table.
- Do not add state management, routers, CSS frameworks, or date libraries until the current code genuinely hurts without them.
- If a better option emerges, document the tradeoff before adopting it.

## Done criteria

Phase 1 is done when:

- Tyler and Ali deterministic astronomy tests pass.
- Current Moon phase/illumination/rise/set sanity checks pass.
- Generated readings match schema exactly.
- Generated readings pass forbidden-word and exemplar-bleed checks.
- Unknown birth time does not fabricate angles/houses.
- AI unavailable still shows real astronomy and a useful fallback.
- Birth data stays local and is never sent to the Worker.
- `npm run build` and the full testing checklist pass.
