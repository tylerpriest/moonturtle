# Signal ranking

The model should write the reading. It should not decide what matters from a raw chart dump.

This document defines how MoonTurtle chooses the loudest 1-3 daily signals before calling the reading engine.

## Goal

Given a natal chart and current sky, produce:

```js
{
  topSignals: Signal[],
  supportingSignals: Signal[],
  omittedBecauseQuiet: Signal[]
}
```

`topSignals` should contain 1-3 signals. The Today UI should show only the useful one to three activation cards, not a padded list.

## Signal shape

```js
{
  id: "moon-sagittarius-opposes-natal-moon",
  type: "transit_to_natal",
  transitingBody: "Moon",
  natalTarget: "Moon",
  aspect: "opposition",
  orb: 1.2,
  applying: true,
  exactAt: "2026-05-07T18:20:00+10:00",
  natalHouse: 12,
  currentHouse: 6,
  score: 82,
  reasons: [
    "Moon signal",
    "natal Moon",
    "tight orb",
    "applying"
  ]
}
```

## Ranking principles

- Tightness beats prestige. A 0.4 degree Venus contact can beat a 6 degree Jupiter contact.
- Personal chart anchors matter: Sun, Moon, Ascendant, Midheaven, chart ruler, Venus, Mars, Nodes, and natal clusters.
- Current Moon and Sun shape the day even when their score is moderate.
- Outer planets matter most when tight, stationary, angular, or touching personal anchors.
- Eclipses, stations, and sign ingresses can override normal scoring.
- Do not rank every possible aspect. Filter aggressively.

## Base weights

Transiting body:

| Body/Event | Base |
|---|---:|
| Eclipse touching natal anchor | 100 |
| Station of Mercury-Pluto | 80 |
| Moon | 55 |
| Sun | 55 |
| Mercury | 40 |
| Venus | 45 |
| Mars | 45 |
| Jupiter | 50 |
| Saturn | 65 |
| Uranus | 60 |
| Neptune | 60 |
| Pluto | 65 |
| Nodes | 55 |

Natal target:

| Target | Add |
|---|---:|
| Ascendant / Descendant | 35 |
| Midheaven / IC | 35 |
| Sun | 30 |
| Moon | 30 |
| Chart ruler | 28 |
| Venus / Mars | 22 |
| North Node / South Node | 20 |
| Mercury | 18 |
| Natal cluster of 3+ bodies | 24 |
| Jupiter / Saturn | 14 |
| Uranus / Neptune / Pluto | 8 |

## Orb modifier

Use the exactness modifier after base + target:

| Orb | Modifier |
|---|---:|
| 0.0-0.5 deg | +35 |
| 0.5-1.0 deg | +25 |
| 1.0-2.0 deg | +15 |
| 2.0-3.0 deg | +8 |
| 3.0-5.0 deg | 0 |
| 5.0+ deg | usually discard |

Suggested maximum orb:

- Moon: 3 deg
- Sun/Mercury/Venus/Mars: 4 deg
- Jupiter/Saturn: 5 deg
- Uranus/Neptune/Pluto: 3 deg unless stationing
- angles: 3 deg
- eclipses: 5 deg for direct contacts, wider only with caution

## Aspect weights

| Aspect | Add |
|---|---:|
| Conjunction | +25 |
| Opposition | +22 |
| Square | +20 |
| Trine | +14 |
| Sextile | +8 |

Use only major aspects for Phase 1.

## Timing modifiers

| Condition | Add |
|---|---:|
| Applying | +8 |
| Exact today | +20 |
| Exact within 48 hours | +10 |
| Separating but exact within previous 24 hours | +6 |
| Sign ingress today | +14 |
| Lunar phase pivot today | +12 |
| Body is stationing within 3 days | +20 |

## House modifiers

If birth time is known:

| Condition | Add |
|---|---:|
| Transit activates angular house | +10 |
| Transit activates natal 1st/4th/7th/10th | +12 |
| Transit activates house containing natal cluster | +10 |
| Transit activates same house as natal Sun/Moon/chart ruler | +8 |

If birth time is unknown, do not use house modifiers.

## Cluster detection

A natal cluster is 3 or more bodies in:

- same sign
- same house
- within 12 degrees of ecliptic longitude

Clusters should be named as fields, not as every planet in the cluster. Example: "Sagittarius 6th-house cluster."

## Output curation

After scoring:

1. Sort by score.
2. Keep only signals above a practical threshold, around 65.
3. Deduplicate signals that describe the same transit-target pair.
4. Group related signals into a single top signal if they form one story.
5. Pick 1-3 top signals.
6. Build one to three activation cards from those top signals and their strongest facets.

## Reading handoff

The AI prompt should receive:

- topSignals
- compact natal anchors
- compact current sky
- enough factual receipts to write specifically
- no raw exhaustive chart dump unless needed

Do not ask the model to discover the loudest signals from scratch.

## Verification

- Tyler and Ali produce plausible top signals on the same test date.
- A quiet day produces 1-2 modest signals, not forced drama.
- A station/eclipsed day rises appropriately.
- Unknown birth time does not rank houses/angles.
- Output reasons explain the score clearly enough for debugging.
