# MoonTurtle — Make It Real (Phase 2 plan)

## Context

MoonTurtle is a sidereal astrology app. A beautiful static prototype exists at `/home/claude/moonturtle/` (Vite + React, 5 screens + onboarding) — but every value is hardcoded to one demo user (Tyler Priest, 13 April 1989, Tauranga NZ → now in Manly Sydney). It's a gorgeous design demo, not a product.

The user has shared their existing **Master Prompt — True-Sky Sidereal Cosmic Operating System** (25 numbered parts, ~5000 words). This is the philosophical, voice, and quality-rule foundation that has been used in direct AI chats. The MoonTurtle UI surfaces only a **curated subset** of those 25 parts (primary headline+body, 5 activations, lunarAxis.reading, notice[4], avoid[4]) — the most contemplation-worthy slices, not the full long-form. The master prompt becomes the spine of the API system prompt; the UI is the curated mirror.

Second seed user added this round: **Ali Sunflowers — born 23 June 1983, 17:58, Melbourne; current location Sydney**. Tyler and Ali together are the two voice-calibration exemplars.

The user wants to bridge that gap with a soft launch to practitioners. Three concrete shifts decided in this planning round:

1. **Real astronomy** — true-sky sidereal calculations replace the hardcoded ephemeris values. (User explicitly de-prioritised the poetic 13-Moon Calendar layer: *"actual moons, actual astronomy."*)
2. **Claude API generates the daily reading prose** in MoonTurtle's strict voice — not the 13-moon Seed/Dream metaphor system, just real sky → real reading.
3. **Soft launch to practitioners** — usable for any birth chart, persistence, hosted as a PWA, no accounts/payments yet.

The product philosophy is non-negotiable and shapes every choice below:
> *"Meaningful enough to contemplate. Never absolute enough to obey."*
> Reading-first, receipts-second. No fatalism. No gamification. Sidereal accuracy.

## Design principles (read before writing code)

These are the load-bearing decisions. Re-read them before adding a feature or refactoring.

For UI work, also read `docs/design-rules.md`. It is the canonical visual and interaction guide.

For Phase 1 implementation, read `docs/phase-1-build-contract.md`, `docs/astronomy-spec.md`, `docs/signal-ranking.md`, `docs/data-privacy-storage.md`, `docs/failure-states.md`, `docs/prompt-ops.md`, and `docs/testing-checklist.md`.

1. **The reading is the product.** Everything else — chart, sky, journal — exists to serve the daily reading. When in doubt, optimise the path that produces today's reading.
2. **Voice is the soul.** The system prompt is a first-class artifact, version-controlled like code. Voice changes are PR-reviewed, regression-tested against both Tyler and Ali exemplars, and batched to preserve prompt-cache hits.
3. **The master prompt (`docs/master-prompt.md`) is the source of voice truth.** The API system prompt is a curation of its 25 parts into the UI's 5 sections. Always re-read the master prompt before tuning voice.
4. **Determinism by default.** Same birth + same date → same chart, same signals, same cached reading. Only prose generation is non-deterministic; it's cached per-day so it's deterministic in practice.
5. **Sidereal is non-negotiable.** Never silently fall back to tropical. If sidereal can't be computed (unknown birth time, broken geocoder), say so explicitly and ask the user for a true-sky screenshot — preserve the master prompt's own fallback rule.
6. **Privacy by data minimisation.** The Worker never sees raw birth data — only the computed chart. Birth details stay in `localStorage`. No accounts in v1.
7. **Graceful degradation.** AI unreachable → still show real astronomy. Geocoder down → manual location entry. localStorage wiped → re-onboard cleanly. The app should never be completely broken.
8. **Two seed users from day one.** Tyler and Ali. The test suite must pass for both. Never optimise for one chart.
9. **No scaffolding for hypothetical futures.** No state library, no CSS framework, no date library, no router until they pay for themselves. Vite + React + native HTML inputs are enough for soft launch.
10. **Mobile-first, not mobile-only.** Design at 390-430px first; desktop is a centred column. One layout, not two.
11. **The codebase should be readable in a single afternoon.** A fresh agent should be productive in an hour. Prefer 30 readable lines over a 5-line abstraction that obscures what's happening.
12. **Astrology vocabulary stays consistent.** *natal* = birth chart, *sky* = current, *axis* = natal-vs-current Moon polarity, *signals* = ranked transits. Pick once; grep for inconsistencies.

### Principles we considered and rejected
- *Test everything* — overkill for soft launch. Cover astronomy (deterministic) and voice (regression against exemplars). Skip UI tests until the product earns them.
- *TypeScript everywhere* — setup cost doesn't pay back for personal-use scale. JS + JSDoc where types help.
- *GraphQL / tRPC* — one endpoint, one schema. REST is fine.
- *Layer-based folders (`components/`, `services/`, `utils/`)* — these put files that change together far apart. We're grouping by feature, not by file type.

## Module boundaries

Code is grouped by **what changes together**, which is a function of *rate of change* and *what the product is*. `reading/` is a first-class module because it IS the product; its sub-concerns (compute, prompt, generate, cache, hook) all evolve when we tune voice.

```
moonturtle/
  app/                         ← React shell, routing
  ui/                          ← screens + components + theme
    components/Primitives.jsx
    screens/{Today,Sky,Natal,Method,Journal,Onboarding}.jsx
    theme/styles.css
  domain/                      ← astrology language (slow-changing, pure)
    astronomy.js               ← computeNatal, computeSky, IAU true-sky signs
    schema.js                  ← Reading / NatalChart / CurrentSky / Place shapes
  reading/                     ← the product (medium-fast change, voice tuning)
    prompt/                    ← system prompt blocks — voice lives HERE, not in docs
      01-identity.md
      02-voice.md
      03-curation.md
      04-schema.md
      05-exemplars.md
    generate.js                ← provider call + schema validation + length retries
    cache.js                   ← localStorage cache keyed by birthHash + YYYY-MM-DD
    useReading.js              ← React hook: astronomy → generate → cache → return
  providers/                   ← AI provider adapters (uniform interface)
    index.js                   ← chooseProvider(model) → adapter
    anthropic.js               ← Claude direct API (hosted production)
    openai.js                  ← OpenAI direct API (hosted production)
    cliproxy.js                ← localhost:8317 (personal BYO use)
  io/                          ← infrastructure adapters (platform-dependent)
    storage.js                 ← localStorage (swappable to IndexedDB / remote)
    geocoding.js               ← Nominatim (swappable to Photon / Google)
    timezone.js                ← tz-lookup
  seed/                        ← exemplars + regression fixtures
    tyler.js                   ← born 13 Apr 1989, Tauranga
    ali.js                     ← born 23 Jun 1983, Melbourne
  config/
    model.js                   ← MT_MODEL env → (provider, model)
functions/api/
  reading.js                   ← Cloudflare Worker; imports reading/prompt/*
docs/
  plan.md                      ← THIS PLAN
  master-prompt.md             ← source of voice truth (verbatim user prompt)
  seed-users.md                ← Tyler + Ali expected sidereal placements
  design-source/               ← original Claude Design HTML/JSX handoff
```

**Why `reading/prompt/` lives next to `reading/generate.js`:** the prompt IS code in this product. Co-locating it with the call site is how we keep voice changes coherent.

**Module contracts:**
- `domain/astronomy.computeNatal(birth) → NatalChart` — pure, deterministic
- `domain/astronomy.computeSky(location, ts) → CurrentSky` — pure, deterministic
- `reading/generate({ chart, sky, userMeta }, provider) → ReadingProse` — schema-validated
- `providers.adapter.generate({ system, messages, schema }) → text` — uniform across providers
- `io/storage.get/set(key, value)` — synchronous
- `io/geocoding.search(text) → Place[]` — async, abortable

**Tests for the boundaries:**
- **Swap test:** changing astronomy library touches only `domain/astronomy.js`. Changing model touches only `config/model.js`. Switching storage touches only `io/storage.js`. No other file should care.
- **Composition test:** a new screen is writable in ~30 lines by composing existing primitives + `useReading()`. No screen knows about HTTP, providers, or ephemeris.
- **Voice-iteration test:** tuning the system prompt requires editing only files under `reading/prompt/`. Nothing else.

## Architecture (locked in)

### Astronomy — true-sky sidereal from IAU constellation boundaries (open-source, built ourselves)

The master prompt requires **true-sky sidereal** with unequal constellation sizes including **Ophiuchus**. Do not copy proprietary MTZ boundary data. Use open astronomical sources and document every convention.

**Approach: compute it ourselves from IAU data.**

The IAU constellation boundaries were defined in 1930 by Eugène Delporte. They are public-domain, well-documented, and bundled with Stellarium, Skyfield, Astropy, and other open astronomy projects. Combined with standard ecliptic geometry, they give us a fully open and reproducible true-sky sidereal system. See `src/domain/zodiac-boundaries.md` for the design note.

**Algorithm (entirely in pure JS, no external data shipped beyond what's already in `astronomy-engine`):**

1. Convert the person's place and time into an observer and UTC instant.
2. Compute each supported physical body's observer-sky position with `astronomy-engine`.
3. Call `Astronomy.Constellation(ra, dec)` — `astronomy-engine` has a built-in IAU constellation lookup.
4. Map the IAU constellation symbol (e.g. `Psc`, `Sco`) to its zodiac name. Nodes, angles, houses, and unsupported bodies use the documented ecliptic-boundary fallback.

**Boundary convention (transparent, our choice — document and defend):**

Because nodes, angles, and houses are ecliptic points rather than bodies, we still have to pick a fallback convention for "which constellation owns this ecliptic longitude." Pre-compute once, ship the result.

```js
// Build-time, generates src/domain/zodiac-boundaries.json (~13 rows)
function buildBoundaries() {
  const boundaries = [];
  let prev = null;
  for (let lon = 0; lon < 360; lon += 0.01) {  // 0.01° resolution
    const sign = trueSkyConstellation(lon);
    if (sign !== prev) {
      boundaries.push({ sign, startDeg: lon });
      prev = sign;
    }
  }
  return boundaries;
}
```

This fallback is **first-crossing convention**: a constellation owns ecliptic longitudes from the moment the ecliptic enters its IAU polygon. Other astrology conventions (centroid-time, midpoint) remain comparable alternatives.

**Why this beats any approach that depends on MTZ:**
1. **Open and reproducible.** Anyone can re-run our build script and get the same boundaries.
2. **Honestly framed.** The Method screen can say physical bodies use observer-sky IAU containment and ecliptic points use a documented fallback — exact and citable.
3. **No third-party dependency.** Doesn't break if MTZ changes their methodology, doesn't require licensing, doesn't risk being a copy.
4. **Aligned with the master prompt.** Re-read the verbatim: *"ideally similar to the Mastering the Zodiac true sidereal midpoint method"* — *similar to*, not *copied from*. MTZ is one valid approach. We do our own and use MTZ as a sanity-check reference, not a data source.
5. **Trivially extensible.** Once we separate physical-body sky positions from ecliptic-point fallbacks, future comparison modes can be tested without blurring the receipts.

**Recommended v1 tool stack:**
- **`astronomy-engine`** (MIT, JS/browser-friendly) — primary sky engine for Sun/Moon/planet positions, moon phases, rise/set, coordinate transforms, and IAU constellation lookup.
- **Custom IAU ecliptic boundary fallback** — MoonTurtle-owned labels for nodes, angles, house cusps, and unsupported objects from `src/domain/zodiac-boundaries.md`; no external true-sky zodiac package is trusted as the source of truth.
- **`celestine`** (MIT, TypeScript, zero runtime dependencies) — evaluate for Placidus houses, aspects, transits, retrogrades, and signal ranking. Use its math primitives only after regression checks pass; do not use its tropical zodiac labels for MoonTurtle signs.
- **`@fusionstrings/swiss-eph`** or **`astro-sweph`** — precision fallback candidates only. Both are Swiss Ephemeris / AGPL-family paths, so they are fine if MoonTurtle stays open-source, but they should not be the first browser/PWA dependency.
- **`circular-natal-horoscope-js`** — older fallback for houses if `celestine` fails verification. It is Unlicense and well-starred, but last npm publish is older and it bundles Moment.

See `docs/open-source-astrology-tools.md` for source links and tradeoffs.

**Sanity check before Phase 1 ships:** run the boundary generator, compare Sun ingress dates against at least one public true-sky date table as a broad sanity check, then trust the reproducible IAU table as MoonTurtle's convention. Run the seed-user regression at `docs/seed-users.md` — both Tyler and Ali must come out within tolerance. Ali's Sun near the Gemini/Cancer boundary is the diagnostic case.

### Reading engine — Claude Opus 4.7 via Cloudflare Worker
- **Model:** `claude-opus-4-7`. Voice control is the product; Sonnet won't hold the knife-edge between contemplation and prescription.
- **Endpoint:** `POST /api/reading` returns structured JSON matching `MT_DATA`'s prose shape (primary, activations[5], lunarAxis.reading, notice[4], avoid[4]).
- **BYO API key (local dev):** `.env.local` with `ANTHROPIC_API_KEY=...` is read by the Vite dev server / local Worker. All calls bill the user's Anthropic account.
- **BYO API key (hosted, optional Phase 2):** Settings screen lets users paste their own key into localStorage; the Worker uses it via a header (`X-User-Provider-Key`) if present, else falls back to `env.ANTHROPIC_API_KEY`.
- **System prompt = distilled Master Prompt + voice exemplars.** 5 cached blocks:
  1. **Identity & Philosophy** (~600 tokens) — sidereal-only mandate, "reading first, receipts second," "meaningful enough to contemplate, never absolute enough to obey," no fatalism, no horoscope-column English, the "loudest 1-3 signals" rule from the master prompt Part 0.
  2. **Voice rules** (~800 tokens) — Cormorant-serif register, no "energy/vibes/alignment/manifestation," metaphor over instruction, second-person never imperative; master-prompt "Quality rules" and "Avoid" lists folded in here.
  3. **Curation rules** (~500 tokens) — the API output is the *curated* slice of the master prompt's 25 parts. Map: `primary.headline+body` ≈ master Parts 2+24; `activations[5]` ≈ Parts 6+7+12 compressed; `lunarAxis.reading` ≈ Part 11 (Moon vs Sun synthesis); `notice[4]` ≈ Parts 17+18 trust-side; `avoid[4]` ≈ Parts 17+18+23 shadow-side. The Worker chooses the 1-3 loudest signals before generating; it does NOT enumerate every transit.
  4. **Schema description** (~400 tokens) — the JSON shape the screens consume.
  5. **Exemplars** (~3000 tokens, `cache_control: ephemeral 1h`) — Tyler's current reading from `data.js` verbatim, wrapped in `<exemplar id="tyler-pisces-gemini">`. Ali's reading added in Phase 2 once generated (`<exemplar id="ali-cancer-melbourne">`). Followed by an explicit "the exemplars are voice references only; never reference their user, birth data, or city in your output."
- **Total system prompt ~5300 tokens cached.** User message ~600 tokens (today's chart + user meta). Per reading cost: **~$0.04 cached, ~$0.08 cold**.
- **Schema enforcement:** structured outputs (`output_config.format.json_schema`), not tool-use. JSON Schema can't enforce `minItems`/`maxItems`, so prompt says "exactly 5 activations / exactly 4 notice / exactly 4 avoid" and the Worker validates server-side, retrying once if counts are wrong.
- **Astronomy computed client-side**, prose computed server-side. The Worker never sees raw birth data, only the chart — privacy story matches the Method screen's pitch.
- **Master-prompt fallback:** if astronomy.js cannot compute a chart confidently (unknown birth time, geocoding failure), the API returns a "needs more info" response and the UI prompts for a true-sky sidereal screenshot — preserving the master prompt's own fallback rule ("If you cannot calculate the full true-sky sidereal chart, ask me for a screenshot before continuing").

### Hosting — Cloudflare Pages + Workers
- Free tier easily covers soft launch (100K Worker req/day, SPA-aware static hosting).
- `functions/api/reading.js` is the Worker. `ANTHROPIC_API_KEY` is an encrypted Pages env var. Separate `ANTHROPIC_API_KEY_PREVIEW` for preview deploys.
- PWA via a tiny hand-written manifest + service worker (~20 lines, no workbox).

### Persistence — localStorage only (v1)
- `mt:user` — birth data + precomputed `birthHash`
- `mt:reading:${birthHash}:${YYYY-MM-DD}` — full merged reading (astronomy + prose), one per user per day
- `mt:journal:${birthHash}` — append-only lightweight history (date, phase, sign, headline)
- ISO dates stored, never display strings. IANA tz, never `+12:00` (DST matters).

### Onboarding — native inputs, Nominatim geocoding
- `<input type="date">` and `<input type="time">` — feels native on iOS, no library shipped.
- **Nominatim** (OSM) for birthplace search, 500ms debounce, no API key. Fallback: Photon.
- **`tz-lookup`** for lat/lon → IANA timezone, OR ask the user to confirm timezone (more honest).
- **Permission screen copy:** currently uses neutral placeholder copy until permission is granted. Phase 1 can add coarse IP geolocation (`request.cf.city`) as a pre-permission hint if it feels useful.

## Phases

### Phase 0 — Preserve source material & restructure (one-time, ~30 min)
Before any code changes:
1. Save the master prompt verbatim as `docs/master-prompt.md`.
2. Save Tyler + Ali birth data and expected sidereal placements as `docs/seed-users.md` (used as regression fixtures).
3. Copy the design source files (`MoonTurtle App.html`, `screens-*.jsx`, etc.) into `docs/design-source/` for reference.
4. Move the existing prototype into the new module layout — `src/components/Primitives.jsx` → `src/ui/components/Primitives.jsx`, `src/screens/*` → `src/ui/screens/*`, etc. The current Tyler-hardcoded `src/data.js` becomes `src/seed/tyler.js`.
5. Create the empty module skeleton: `src/{domain,reading,providers,io,seed,config}/` with placeholder `index.js` files. App still compiles; nothing wired yet.

**Status:** complete in this repo.

### Phase 1 — End-to-end loop (the soft launch)
Goal: real birth → real sky → real reading, working for any user, deployed.

1. **`src/domain/astronomy.js`** — pure functions `computeNatal(birth)` and `computeSky(location, timestamp)` matching `domain/schema.js` shapes. Regression-test against BOTH Tyler and Ali fixtures from `seed/`.
2. **`src/io/{geocoding,timezone,storage}.js`** — three small adapters: Nominatim search, `tz-lookup`, localStorage with the keys defined in the Persistence section.
3. **`src/ui/screens/Onboarding.jsx`** — replace static `FormField` divs with controlled inputs; wire `io/geocoding` + `io/timezone`; save via `io/storage`; compute and store `birthHash`.
4. **`src/reading/prompt/{01-identity,02-voice,03-curation,04-schema,05-exemplars}.md`** — write the 5 prompt blocks. Block 5 holds Tyler's reading verbatim (Ali added in Phase 2).
5. **`src/providers/{index,anthropic,openai,cliproxy}.js`** — uniform `generate({ system, messages, schema })` interface. `config/model.js` reads `MT_MODEL` env and selects the adapter.
6. **`functions/api/reading.js`** — Cloudflare Worker: imports `reading/prompt/*` blocks (Vite-aware build), calls `providers` adapter, validates schema, retries on length mismatch, supports master-prompt fallback path. Honours `X-User-Provider-Key` for BYO hosted users.
7. **`src/reading/{generate,cache,useReading}.js`** — orchestrates: check cache; if miss, run astronomy locally, POST signals to `/api/reading`, merge, write to cache. Exposes `useReading()` to screens.
8. **All five screens** read from `useReading()` instead of importing `seed/tyler.js`. Today, Sky, Natal, Journal become live; Method stays static.
9. **PWA scaffold** — `public/manifest.webmanifest` + `public/sw.js` (~20 lines, no workbox).
10. **Local BYO launcher** — `scripts/dev-byo.sh` starts CLIProxyAPI in the background and runs Vite. `npm run dev:byo` runs it. `.env.local.example` documents the env vars.
11. **Deploy** to Cloudflare Pages.

### Phase 2 — Polish
- Real Journal screen pulling from `mt:journal:*` (currently hardcoded `ITEMS`).
- Voice iteration based on real readings from Tyler + Ali + a small practitioner cohort. Generate Ali's first reading, hand-edit it to the user's taste, then add as the second `<exemplar>` block. Batch prompt edits to minimise cache invalidation.
- "View chart wheel" CTA in NatalScreen — actually render a wheel.
- Placidus as a Method-screen setting after the house engine is verified (`celestine` first, `circular-natal-horoscope-js` fallback).
- **BYO API key UI** — Settings screen lets hosted users paste their own Anthropic key (was already supported via env var for local dev).

### Deferred (do NOT do for soft launch)
- User accounts / cloud sync (one device per practitioner is fine)
- The named 13-Moon Calendar (Seed → Dream) — explicit user de-prioritisation
- Aspects, transits over time, progressions, lunar return
- Push notifications (iOS PWA support is fiddly)
- Multi-language, analytics, paywall

## Critical files (paths relative to repo root)

Note: Phase 0 restructures the existing prototype into module folders. Paths below assume the post-Phase-0 layout.

| Path | Change |
|---|---|
| `src/seed/tyler.js` | **MOVE FROM `src/data.js`.** Becomes one of two seed exemplars. |
| `src/seed/ali.js` | **NEW.** Ali Sunflowers birth data + expected sidereal placements. |
| `src/domain/astronomy.js` | **NEW.** `computeNatal`, `computeSky`, IAU true-sky sign lookup. |
| `src/domain/schema.js` | **NEW.** Shape definitions for `Reading`, `NatalChart`, `CurrentSky`, `Place`. |
| `src/reading/useReading.js` | **NEW.** React hook. Orchestrates astronomy → generate → cache. |
| `src/reading/generate.js` | **NEW.** Calls provider, validates schema, retries on length mismatch. |
| `src/reading/cache.js` | **NEW.** localStorage-backed daily cache keyed by `birthHash:date`. |
| `src/reading/prompt/{01-identity,02-voice,03-curation,04-schema,05-exemplars}.md` | **NEW.** Five system-prompt blocks. Block 5 cached `ephemeral 1h`. |
| `src/providers/{index,anthropic,openai,cliproxy}.js` | **NEW.** Uniform `generate()` adapter, one file per provider. |
| `src/io/{storage,geocoding,timezone}.js` | **NEW.** Infrastructure adapters. Small, swappable. |
| `src/config/model.js` | **NEW.** Reads `MT_MODEL` env → returns `(provider, model)`. |
| `src/ui/components/Primitives.jsx` | **MOVE FROM `src/components/Primitives.jsx`.** No code changes. |
| `src/ui/screens/Onboarding.jsx` | **MODIFY.** Real inputs, `io/geocoding`, `io/storage` writes. |
| `src/ui/screens/TodayScreen.jsx` | **MODIFY.** Use `useReading()`, not the seed import. |
| `src/ui/screens/SkyScreen.jsx` | **MODIFY.** Use `useReading()`. **Update static "Swiss Ephemeris" copy → "IAU true-sky boundaries + Astronomy Engine".** |
| `src/ui/screens/NatalScreen.jsx` | **MODIFY.** Use `useReading()`. |
| `src/ui/screens/JournalScreen.jsx` | **MODIFY.** Read from `io/storage` (key `mt:journal:*`). |
| `src/ui/theme/styles.css` | **MOVE FROM `src/styles.css`.** No code changes. |
| `src/app/App.jsx` | **MOVE FROM `src/App.jsx`.** Mount `useReading()` provider at root. |
| `functions/api/reading.js` | **NEW.** Cloudflare Worker. Imports `src/reading/prompt/*` and `src/providers/*`. |
| `docs/plan.md` | **NEW.** This plan, copied into the repo for the next agent. |
| `docs/master-prompt.md` | **NEW.** Verbatim master prompt (source of voice truth). |
| `docs/seed-users.md` | **NEW.** Tyler + Ali expected sidereal placements; regression fixtures. |
| `docs/design-source/` | **NEW.** Copy of original Claude Design HTML/JSX bundle for visual reference. |
| `public/manifest.webmanifest` | **NEW.** PWA manifest. |
| `public/sw.js` | **NEW.** Minimal service worker (~20 lines, no workbox). |
| `scripts/dev-byo.sh` | **NEW.** Starts CLIProxyAPI then Vite. Used by `npm run dev:byo`. |
| `.env.local.example` | **NEW.** Documents `MT_MODEL`, `ANTHROPIC_API_KEY`, `OPENAI_BASE_URL` etc. |
| `wrangler.toml` | **NEW.** Cloudflare Pages config. |
| `package.json` | **MODIFY.** Add `dev:byo` script now. Add runtime packages as Phase 1 code starts using them: `astronomy-engine`, `celestine` if verified, `tz-lookup`, provider SDKs only where the Worker actually imports them. |

## Verification

1. **Regression check (astronomy — Tyler):** enter Tyler's birth → output must match `src/seed/tyler.js` and `docs/seed-users.md` within the documented tolerance (Sun Pisces 9th, Moon Gemini 12th, Asc Gemini, etc.). If Sun comes out Aries, the true-sky sign lookup is wrong or bypassed.
2. **Regression check (astronomy — Ali):** enter 23 June 1983, 17:58 Melbourne → assert against `docs/seed-users.md`. Ali's Sun must remain Gemini under MoonTurtle's IAU convention.
3. **Current sky sanity:** Sky screen for any timestamp + location must match a sanity-check from `timeanddate.com` (lunar illumination ±0.5%, moonrise/moonset ±2 min).
4. **Reading shape:** generated reading must have `activations.length === 5`, `notice.length === 4`, `avoid.length === 4`. Worker retries once; logs if final response is malformed.
5. **Voice check (no exemplar bleed):** generate readings for Ali → confirm no leaks of "Tyler," "Tauranga," or "Manly" from the exemplar. Once Ali's reading is added as a second exemplar, generate for a third test birth and check neither exemplar's specifics leak.
6. **Voice check (loudest signals rule):** generated reading must NOT enumerate every planetary placement — verify the 5 activations focus on the loudest 1-3 sky signals as per master prompt Part 0.
7. **Forbidden-word check:** grep generated reading for "energy", "vibes", "alignment", "manifestation", "the universe", "abundance" — must be zero hits.
8. **Cache hits:** after 3 readings, `response.usage.cache_read_input_tokens` should be ~5000. If 0, the system prompt is changing between requests.
9. **Master-prompt fallback:** enter a birth with unknown time → API returns "needs more info" and the UI prompts for a sidereal screenshot rather than fabricating houses/Ascendant.
10. **PWA install:** Safari iOS "Add to Home Screen" produces a launchable icon; reading from yesterday is still visible offline.
11. **Cost ceiling:** 100 readings/day burns ~$4/day. Set a Cloudflare Worker alert if request count exceeds expected volume.

## Key risks

- **Sidereal/tropical mixing in house cusps** — bodies and cusps must share one ecliptic frame.
- **Time zones** — birth time is local civil; DST and historical tz changes matter. Use IANA, not numeric offsets.
- **Exemplar bleed** — the Tyler reading in the cached system prompt risks leaking specifics into other users' readings. Mitigation: `<exemplar>` tags + explicit "do not reference its user" rule + test with non-Tyler births.
- **First-call latency** — Opus 4.7 with adaptive thinking + cache write ≈ 5–8 s. Show a "writing your reading…" state; 60s fetch timeout.
- **Tool drift** — astrology packages move fast and licensing varies. Re-check `docs/open-source-astrology-tools.md` before adding a math dependency.

## Open questions (non-blocking)

- Mean Node vs True Node for the lunar nodes? (Convention: Mean for Vedic, True for modern Western. Document the choice in Method.)
- Bring the named 13-Moon Calendar back as a Phase 2 layer on top of real astronomy, or drop entirely? (User said "actual moons" — I read that as drop for now; revisit if/when they ask.)
- Should we expose a "long-form mode" toggle in v1, or keep the curated UI as the only surface until Phase 2? (Leaning Phase 2 — curated surface is what makes MoonTurtle distinct.)
- The second master prompt (multi-system profile) surfaced 11 May 2026 and lives at `docs/master-prompt-systems.md`. It's a different product surface (profile, not daily) — candidate for Phase 3+. Suggested system additions documented at `docs/additional-systems.md`.
- The third sibling prompt for "daily readings" lives at `docs/master-prompt-daily.md`.

## Appendix — Other open-source libraries (reference only, not adopted)

The current survey lives in `docs/open-source-astrology-tools.md`. Re-check active packages before implementation; prefer permissive, auditable libraries unless a copyleft dependency is an explicit product choice.

## Appendix — Accessing other AI conversation history

For pulling context from past ChatGPT / Claude / Codex chats into this build:

- **MyChatArchive** ([mychatarchive.com](https://mychatarchive.com/)) — primary recommendation. Open-source, local-first import of ChatGPT/Claude/Grok/Cursor exports with an MCP server that exposes them to Claude Code. Vector embeddings generated locally.
- **claude-conversation-extractor** ([GitHub](https://github.com/ZeroSumQuant/claude-conversation-extractor)) — reads `~/.claude/projects/*.jsonl` directly. For Claude Code's own history.
- **Claude Code Exporter** ([MCP server](https://lobehub.com/mcp/developerisnow-claude-code-exporter)) — alternative MCP for Claude Code transcripts.
- **Native exports** — [Claude](https://support.claude.com/en/articles/9450526-how-can-i-export-my-claude-data) Settings → Privacy; ChatGPT Settings → Data Controls → Export.
- **Not the right tool:** OpenClaw (autonomous agent), Hermes (agent framework) — both useful, neither imports conversations.

Setup order if pursuing: native export each service → import to MyChatArchive → add MyChatArchive's MCP server to `~/.claude.json` so Claude Code can search history natively.
