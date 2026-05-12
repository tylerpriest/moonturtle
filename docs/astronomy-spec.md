# Astronomy spec

This is the implementation spec for `src/domain/astronomy.js`.

MoonTurtle's astronomy is deterministic. Same input, same date, same location, same output.

## Inputs

### Birth input

```js
{
  name: "Tyler",
  date: "1989-04-13",
  time: "13:55",
  timeZone: "Pacific/Auckland",
  place: {
    name: "Tauranga, Bay of Plenty, New Zealand",
    lat: -37.6878,
    lon: 176.1651
  },
  birthTimeKnown: true
}
```

Use IANA time zones. Do not store or rely on numeric offsets except as display/debug information.

### Current sky input

```js
{
  timestamp: "2026-05-07T09:41:00+10:00",
  timeZone: "Australia/Sydney",
  place: {
    name: "Manly, Sydney, Australia",
    lat: -33.7969,
    lon: 151.2840
  }
}
```

Use ISO timestamps internally. Format dates only at the UI edge.

## Time handling

- Birth time is local civil time at birthplace.
- Convert birth date/time + IANA zone to a UTC instant before computing positions.
- Historical DST matters. Never assume today's offset applied in the birth year.
- Current sky uses current/manual place's IANA zone.
- If timezone lookup is ambiguous, ask the user to confirm rather than guessing silently.

## Coordinate and sign convention

MoonTurtle signs use:

- actual observer-sky body position for physical bodies
- IAU 1930 constellation boundaries / containment lookup
- 13 zodiac constellations, including Ophiuchus, when the body falls in one of those regions
- documented ecliptic-boundary fallback for nodes, angles, houses, and unsupported bodies

Do not use:

- tropical 12-sign zodiac
- equal 30-degree sidereal signs
- Lahiri/Krishnamurti/Fagan-Bradley sign labels
- copied MTZ midpoint boundary data

`astronomy-engine` should provide physical-body sky positions and IAU constellation lookup. MoonTurtle's `src/domain/zodiac-boundaries.json` table remains a fallback for ecliptic points, not the primary physical-body sign source.

## Bodies

Natal chart should include:

- Sun
- Moon
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- Chiron, if the chosen library supports it reliably; otherwise document omission
- North Node
- South Node

Current sky should include at least:

- Sun
- Moon
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- Nodes, eclipses, retrograde flags, and stations if available/reliable

## Houses and angles

Use Placidus for v1 when birth time is known.

Required angles:

- Ascendant
- Descendant
- Midheaven
- IC

If birth time is unknown or uncertain:

- do not compute or display houses
- do not compute or display angles
- do not rank signals that depend on houses/angles
- tell the reading layer that birth time is unknown

Evaluate `celestine` first for Placidus houses and aspects. Use `circular-natal-horoscope-js` only if `celestine` fails verification.

## Nodes

Default to True Node for modern daily readings unless a later explicit decision changes this.

Document the node convention in Method copy and test fixtures. If a dependency only provides Mean Node, expose that fact clearly and decide before shipping.

## Retrogrades and stations

Mark retrograde state for Mercury through Pluto when available.

Station days count as loud signals even if the exact natal contact is not tight. A station should be represented as a signal input to `docs/signal-ranking.md`.

## Moon data

Current sky must compute:

- lunar phase name
- illumination percentage
- lunation age
- cycle percentage
- Moon true-sky constellation
- Sun true-sky constellation
- moonrise
- moonset
- previous or next quarter/new/full when available

Sanity check against a public sky source:

- illumination within about 0.5 percentage points
- rise/set within about 2 minutes, allowing for source/model differences

## Output shapes

`computeNatal(birth)` returns:

```js
{
  user: { name, birth },
  bodies: [{ body, sign, longitude, latitude, house, retrograde, sym, signMethod, position }],
  angles: [{ angle, sign, longitude, signMethod }],
  birthTimeKnown: true,
  framework: "IAU_ACTUAL_SKY_TOPOCENTRIC",
  houseSystem: "Placidus",
  nodeType: "True"
}
```

`computeSky(input)` returns:

```js
{
  timestamp,
  place,
  lunar,
  bodies,
  visiblePlanets,
  framework: "IAU_ACTUAL_SKY_TOPOCENTRIC"
}
```

Use stable, boring field names. Prefer adding fields over changing names after UI/reading code depends on them.

## Regression fixtures

Use `docs/seed-users.md` as the current fixture source.

Important checks:

- Tyler Sun must remain Pisces.
- Tyler Moon must remain Gemini.
- Ali Sun must remain Gemini under MoonTurtle's convention.
- Ali Ascendant must be Sagittarius when birth time is known.

If the actual-sky IAU implementation disagrees with prototype fixtures near a boundary, update the fixture with a dated note explaining the convention difference. Do not silently bend the math to match old prose.
