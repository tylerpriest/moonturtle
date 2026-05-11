# Data privacy and storage

MoonTurtle v1 is local-first. Birth data is sensitive. Store the minimum, send the minimum, log the minimum.

## Privacy rule

Raw birth details stay on the user's device in v1.

The Worker may receive:

- computed natal chart
- computed current sky
- ranked signals
- non-identifying display preferences

The Worker must not receive:

- raw birth date
- raw birth time
- raw birthplace search text
- raw current location permission result
- full name unless the user explicitly opts into personalized naming

## Storage keys

Use namespaced localStorage keys:

```text
mt:v1:user
mt:v1:reading:{birthHash}:{YYYY-MM-DD}
mt:v1:journal:{birthHash}
mt:v1:settings
mt:v1:schemaVersion
```

Use `v1` in keys so future migrations can be explicit.

## User record

`mt:v1:user`:

```js
{
  schemaVersion: 1,
  displayName: "Tyler",
  birth: {
    date: "1989-04-13",
    time: "13:55",
    timeZone: "Pacific/Auckland",
    timeKnown: true,
    place: {
      name: "Tauranga, Bay of Plenty, New Zealand",
      lat: -37.6878,
      lon: 176.1651
    }
  },
  currentPlacePreference: {
    mode: "device" // or "manual"
  },
  birthHash: "stable-nonreversible-hash"
}
```

`birthHash` should be stable for cache keys but not useful as a public identifier. Use Web Crypto when available.

## Reading cache

`mt:v1:reading:{birthHash}:{YYYY-MM-DD}`:

```js
{
  schemaVersion: 1,
  date: "2026-05-07",
  generatedAt: "2026-05-07T09:45:00+10:00",
  chartHash: "hash-of-computed-chart",
  skyHash: "hash-of-current-sky",
  signalsHash: "hash-of-ranked-signals",
  astronomy: { },
  signals: [ ],
  prose: {
    primary: { },
    activations: [ ],
    lunarAxis: { },
    notice: [ ],
    avoid: [ ]
  },
  providerMeta: {
    provider: "anthropic",
    model: "claude-opus-4-7",
    promptVersion: "reading-prompt-v1"
  }
}
```

Cache one reading per birthHash/date. If the user changes birth data, create a new birthHash and leave old entries orphaned until reset/cleanup.

## Journal

`mt:v1:journal:{birthHash}`:

```js
{
  schemaVersion: 1,
  entries: [
    {
      date: "2026-05-07",
      phase: "Waning Gibbous",
      illumination: 74.6,
      moonSign: "Sagittarius",
      headline: "Today is a make meaning from the map day.",
      readingCacheKey: "mt:v1:reading:..."
    }
  ]
}
```

Journal v1 stores reading history metadata, not private diary text, unless the user explicitly asks for notes later.

## Settings

`mt:v1:settings`:

```js
{
  schemaVersion: 1,
  model: "claude-opus-4-7",
  providerMode: "app-key", // or "user-key" / "cliproxy"
  userProviderKeyStored: false,
  currentPlaceMode: "device"
}
```

If hosted BYO provider keys are added, store them only with explicit user consent and make deletion obvious.

## Network payload

`POST /api/reading` should receive:

```js
{
  promptVersion: "reading-prompt-v1",
  date: "2026-05-07",
  natalChart: { },
  currentSky: { },
  topSignals: [ ],
  userMeta: {
    displayName: "Tyler" // optional
  }
}
```

Do not include raw birth data or raw geolocation permission data.

## Logging

Client logs:

- okay: error type, cache hit/miss, schema version, anonymized status
- not okay: full chart payload, raw birth details, location coordinates, provider key

Worker logs:

- okay: request id, model, validation result, error code, rough latency
- not okay: prompt body, raw payload, full generated reading, user key

## Reset and deletion

Settings should eventually expose:

- clear today's reading
- clear all readings
- clear journal history
- reset birth data
- reset everything

For Phase 1, implement a developer-safe `storage.clearAllMoonTurtleData()` helper and keep it scoped to `mt:v1:*`.

## Migration

Every stored object has `schemaVersion`.

On version mismatch:

- try a small explicit migration if safe
- otherwise re-onboard cleanly
- never crash the app on malformed localStorage

## Verification

- Inspect Network tab: no raw birth date/time/place is sent to `/api/reading`.
- Clear localStorage: onboarding starts cleanly.
- Change birth data: new birthHash, new cache key.
- AI unavailable: reading cache remains intact.
- Malformed localStorage value: app recovers without a blank screen.
