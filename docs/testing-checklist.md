# Testing checklist

Run this before calling Phase 1 done.

## Basic app health

```bash
npm install
npm run check:release
npm run build
npm audit --audit-level=moderate
```

Manual:

- app loads at Vite URL
- no console errors on first load
- onboarding displays
- tab navigation works after onboarding
- mobile width around 390-430px has no overlap

## Astronomy regression

Tyler:

- Sun Pisces
- Moon Gemini
- Ascendant Gemini, if birth time known
- Midheaven Aries, if birth time known
- no tropical Aries Sun leak

Ali:

- Sun Gemini
- Moon Ophiuchus under MoonTurtle's actual-sky IAU convention
- Ascendant Sagittarius, if birth time known
- Jupiter marked as chart ruler if Sagittarius rising

Boundary:

- generated ecliptic fallback table contains 13 constellations including Ophiuchus
- Sun ingress dates broadly match public true-sky date tables
- `npm run check:astronomy` passes

## Current sky sanity

For one known timestamp/location:

- Moon illumination within about 0.5 percentage points of public sky source
- moonrise/moonset within about 2 minutes
- Sun and Moon true-sky signs plausible under actual observer-sky IAU lookup
- local date displays with day and month clearly

## Signal ranking

- topSignals length is 1-3
- each signal has score and reasons
- exact/tight aspects outrank loose prestige aspects
- unknown birth time removes angle/house scoring
- station/eclipse/ingress events can rise appropriately
- activation cards derive from top signals instead of random chart enumeration

## Reading schema

Generated prose object:

- has `primary.headline`
- has `primary.body`
- has 1 to 3 activations
- each activation has `title` and `reading`
- has `lunarAxis.natalSign`, `lunarAxis.currentSign`, `lunarAxis.reading`
- has exactly 4 notice items
- has exactly 4 avoid items
- contains plain text only
- `npm run check:reading` passes

## Voice

Check:

- no generic horoscope column tone
- no fatalism
- no commands dressed as wisdom
- no overlong theory explanation
- no "energy/vibes/alignment/manifestation/universe/abundance" filler
- no exemplar bleed from Tyler or Ali
- reading focuses on loudest 1-3 signals

## Privacy and storage

Inspect localStorage:

- keys use `mt:v1:*`
- user record has schemaVersion
- reading cache key includes birthHash/date
- malformed storage does not blank the app

Inspect `/api/reading` request:

- no raw birth date
- no raw birth time
- no raw birthplace text
- no raw device geolocation result
- sends computed chart/current sky/signals only

## Failure states

Manually trigger:

- geocoding fails
- timezone ambiguous
- birth time unknown
- astronomy throws
- AI unavailable
- generated JSON invalid
- offline
- localStorage cleared
- permission denied
- invalid provider key

Expected:

- app stays usable
- real astronomy shows where possible
- no fake reading prose
- no silent framework fallback

## PWA

After PWA scaffold:

- manifest loads
- service worker registers
- installable on iOS/desktop where supported
- cached yesterday reading remains visible offline
- fresh AI reading correctly waits for network

## Final smoke

- `npm run build` passes
- `npm audit --audit-level=moderate` passes
- read `docs/design-rules.md` before UI signoff
- read `docs/phase-1-build-contract.md` before scope signoff
