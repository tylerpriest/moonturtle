# MoonTurtle PRD

## Product

MoonTurtle daily true-sky reading app.

## Version

Soft-launch PRD for the current local-first PWA product.

## Objective

Deliver a working daily reading loop:

```text
birth data + current location
  -> deterministic true-sky sidereal astronomy
  -> ranked current signals
  -> cached MoonTurtle-voice reading
  -> receipts, natal context, and journal continuity
```

## Users

- Astrology-literate practitioner who wants a daily symbolic reading without generic horoscope language.
- Reflective beginner who wants a calm daily prompt and clear method.
- Product owner or tester validating MoonTurtle's voice, astronomy, privacy, and flow.

## User needs

- I need to enter birth details once and know they stay on my device.
- I need today's reading to be specific to my chart and the current sky.
- I need to understand enough of the method to trust the interpretation.
- I need the app to be usable when AI is offline, disabled, or misconfigured.
- I need a record of readings without gamified pressure.

## Core experience

### 1. Onboarding

The user enters:

- display name
- birth date
- birth time, or marks birth time unknown
- birth place, resolved to coordinates and timezone
- current place, either from permission, manual entry, or birth-place fallback

Requirements:

- Use native date and time inputs where possible.
- Save raw birth data only in local storage.
- Create a stable birth hash for reading cache keys.
- Do not imply location is detected before permission is granted.
- Allow manual fallback when geocoding or timezone lookup fails.
- Unknown birth time must remove angles and houses from interpretation.

Acceptance:

- User can complete onboarding without granting location permission.
- Malformed local storage does not permanently break onboarding.
- Worker request payloads do not contain raw birth date, birth time, or birthplace text.

### 2. Today

Today is the primary product surface.

Requirements:

- Show local date and a calm greeting.
- Lead with primary reading headline and body.
- Show Moon axis synthesis.
- Show exactly five activation cards.
- Show exactly four "notice" and four "avoid" items.
- Provide a path to receipts without making receipts the main event.
- Show meaningful loading states for sky, natal, signals, reading, validation, and save.

Acceptance:

- Reading content comes from the live reading state, cache, or explicit fallback.
- No fatalistic, predictive, or command-heavy language appears in generated content.
- AI failure still leaves useful astronomy and a clear fallback state.

### 3. Sky

Sky is the current-sky receipts screen.

Requirements:

- Show current Moon sign, phase, illumination, rise and set.
- Show current Sun and relevant planets.
- Show current method and framework.
- Keep facts compact and transparent.

Acceptance:

- Moon phase and illumination pass sanity checks against public sky sources.
- Screen remains useful when reading generation fails.

### 4. Natal

Natal is the user's baseline pattern.

Requirements:

- Show core natal placements with true-sky signs.
- Show angles and houses only when birth time is known.
- Identify chart ruler when available.
- Synthesize before listing raw placements.

Acceptance:

- Unknown birth time does not fabricate Ascendant, Midheaven, houses, or chart ruler.
- No tropical sign labels leak into natal display.

### 5. Journal

Journal provides continuity without pressure.

Requirements:

- Store a lightweight local entry per generated reading variant.
- Show date, phase, headline, source, and whether fallback was used.
- Avoid streaks, scores, badges, levels, or unlock language.

Acceptance:

- Same-day cached reading does not create duplicate preferred journal entries.
- Clearing local storage resets journal cleanly.

### 6. Method and settings

Method explains astronomy, interpretation, agency, privacy, and model behavior.

Requirements:

- State that MoonTurtle uses true-sky sidereal IAU constellation boundaries.
- Separate astronomy from interpretation.
- Make privacy posture explicit.
- Allow model or local fallback settings where implemented.
- Explain fallback state without defensive disclaimers.

Acceptance:

- A practitioner can understand the calculation convention at a high level.
- User can switch to local-only mode where supported.

## Functional requirements

- Compute natal chart locally from birth input.
- Compute current sky locally from current place and timezone.
- Rank one to three loudest signals before prose generation.
- Generate or derive reading content in the required schema.
- Cache same-day readings by birth hash, date, and AI mode.
- Append local journal entries.
- Validate generated reading schema before display.
- Provide explicit fallbacks for provider, network, geocoding, timezone, permission, and local storage failures.

## Nonfunctional requirements

- Privacy: raw birth data remains local in v1.
- Determinism: same birth input and date should produce stable chart, sky, signals, and cached reading.
- Transparency: no silent tropical fallback.
- Performance: app should build and load with the current lightweight dependency set.
- Accessibility: controls must be real buttons and inputs, text must remain readable at mobile width.
- Resilience: no failure state should blank the whole app.

## Reading schema requirements

The UI expects:

- `primary.headline`
- `primary.body`
- `activations[5]`, each with `title` and `reading`
- `lunarAxis.natalSign`
- `lunarAxis.currentSign`
- `lunarAxis.reading`
- `notice[4]`
- `avoid[4]`
- source metadata needed for cache, journal, and fallback display

The generator must validate counts and retry or fallback if the response is invalid.

## Voice requirements

The reading must be:

- contemplative
- image-anchored
- specific to chart and sky receipts
- nonfatalistic
- agency-preserving
- plain text only

Avoid:

- generic horoscope tone
- certainty theater
- commands dressed as insight
- "the universe is telling you"
- filler such as energy, vibes, alignment, manifestation, abundance
- exemplar bleed from seed users

## Release criteria

- `npm run build` passes.
- Testing checklist passes for the implemented scope.
- Tyler and Ali chart regressions pass within documented tolerance.
- Reading schema validation passes for AI and local fallback modes.
- Manual failure-state checks do not blank the app.
- Privacy inspection confirms Worker receives computed chart/current sky/signals only.
- Mobile viewport around 390-430px has no major overlap or text spill.

## Dependencies and constraints

- Vite, React, and current CSS system.
- `astronomy-engine` for sky calculations.
- `celestine` where verified for chart math.
- `tz-lookup` for timezone inference.
- Cloudflare Pages and Functions for hosted static app plus reading API.
- No new state library, router, CSS framework, or date library unless the current code genuinely needs it.

## Risks

- True-sky boundary conventions can confuse users if explained poorly.
- AI prose can drift into generic or prescriptive language.
- Provider configuration can fail in hosted or BYO modes.
- Geocoding and timezone services can be wrong or unavailable.
- Existing docs have some phase-history drift and need periodic refresh.

## Out of scope for this PRD

- Payments, accounts, sync, analytics dashboards, and admin tools.
- Push notifications.
- Social sharing.
- Full chart wheel.
- Professional astrologer workstation features.
- Multi-language support.
