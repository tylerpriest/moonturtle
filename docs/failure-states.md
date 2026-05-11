# Failure states

MoonTurtle should degrade honestly. If something cannot be known or computed, say so plainly and keep the rest of the app useful.

## Principle

Never silently substitute a different astrology framework, location, time zone, or chart assumption.

## Geocoding fails

Cause:

- Nominatim/Photon unavailable
- query too vague
- network offline

UI:

- show manual latitude/longitude entry
- keep the user's typed place name
- explain that place search failed, not astrology

Reading:

- do not generate location-sensitive current sky until coordinates are known

## Time zone ambiguous

Cause:

- place lookup lacks reliable time zone
- historical offset uncertain

UI:

- ask the user to confirm an IANA time zone if possible
- show the inferred option and "change" affordance

Reading:

- do not compute houses/angles from a guessed birth instant

## Birth time unknown

UI:

- allow "I don't know"
- explain that Moon may still be usable, but houses/angles may not be

Astronomy:

- compute date-based bodies where reliable
- omit Ascendant, Midheaven, IC, Descendant
- omit houses
- mark `birthTimeKnown: false`

Reading:

- never overstate houses, angles, or chart ruler if they depend on unknown time
- ask for a true-sky screenshot only if needed to continue

## Astronomy cannot compute

Cause:

- dependency error
- invalid date
- boundary lookup failure
- unsupported body

UI:

- show an error in the receipts area
- keep onboarding/user data intact
- offer retry or manual screenshot path

Reading:

- do not call the AI with incomplete or untrusted chart data unless the prompt explicitly receives `needs_more_info`

## AI/API unavailable

Cause:

- provider outage
- Worker error
- key missing
- timeout

UI:

- still show Sky and Natal receipts
- Today shows a calm unavailable state
- if cached reading exists for the day, show it with "cached" metadata

Reading:

- no fake prose
- no fallback horoscope
- no alternate model unless configured

## Generated JSON invalid

Worker:

- validate schema
- retry once with the validation error summarized
- if still invalid, return a structured error

UI:

- show astronomy receipts and a "reading could not be written cleanly" state
- preserve raw invalid output only in development logs, not user UI

## Forbidden words or voice drift

Worker or local validator:

- scan generated prose for forbidden terms from `src/reading/prompt/02-voice.md`
- retry once if hit
- if still failing, return structured voice validation error

UI:

- do not show failed prose

## Offline

UI:

- show cached reading if available
- show locally computed astronomy if dependencies are available
- mark fresh AI reading unavailable until back online

Storage:

- queue nothing in Phase 1
- do not create hidden sync state

## localStorage unavailable or corrupted

UI:

- show clean onboarding or in-memory mode
- avoid blank screen

Storage:

- all reads are try/catch
- malformed JSON returns null and is overwritten only after explicit user action or safe migration

## Permission denied

Current location:

- switch to manual current location entry
- do not nag repeatedly

Birth location:

- use place search/manual coordinates; birth location does not require device permission

## Provider key invalid

UI:

- show key configuration issue
- keep astronomy visible
- do not repeatedly retry

Worker:

- return structured `provider_auth_failed`

## Error shape

Use stable app errors:

```js
{
  code: "geocoding_failed",
  title: "Place search failed",
  message: "Enter the place manually or try again.",
  retryable: true
}
```

Common codes:

- `geocoding_failed`
- `timezone_ambiguous`
- `birth_time_unknown`
- `astronomy_failed`
- `provider_unavailable`
- `provider_auth_failed`
- `reading_schema_invalid`
- `voice_validation_failed`
- `offline`
- `storage_unavailable`

## Verification

Before shipping Phase 1, manually trigger each failure state at least once.
