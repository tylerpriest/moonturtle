# Ecliptic boundary fallback — design note

This file describes MoonTurtle's fallback for points that are ecliptic coordinates rather than physical bodies: lunar nodes, angles, house cusps, and unsupported objects. Physical bodies use actual observer-sky position and `Astronomy.Constellation(ra, dec)` first; the generated table in `src/domain/zodiac-boundaries.json` is used when the input is only an ecliptic longitude.

## The problem

The master prompt requires **true-sky sidereal** — signs based on actual visible constellations, with unequal lengths, including Ophiuchus. Physical planets and luminaries can be placed by their observer-sky direction. Nodes, angles, and house cusps are mathematical ecliptic points, so they still need a transparent zodiac boundary convention.

- **Tropical**: rejected by the master prompt.
- **Equal-sign sidereal (Lahiri, Krishnamurti, Fagan-Bradley)**: still uses 12 equal 30° divisions, just shifted by an ayanamsa. Master prompt explicitly says *"Do not silently switch to standard equal-sign sidereal astrology."*
- **Mastering the Zodiac (MTZ)**: a true-sky midpoint method, but their boundaries are a proprietary convention and not openly published in a machine-readable form.

## Our approach: IAU 1930 boundaries via `astronomy-engine`

The IAU constellation boundaries were defined in 1930 by Eugène Delporte under the International Astronomical Union. They are **public-domain**, well-documented, and already implemented in `astronomy-engine` via its `Astronomy.Constellation(ra, dec)` lookup function.

For physical bodies, MoonTurtle computes the body's observer-sky position, then uses IAU constellation containment directly. For ecliptic points, we use this table to ask which IAU constellation the ecliptic line occupies at that longitude. The 13 constellations the ecliptic crosses are the standard 12 plus Ophiuchus.

### Algorithm

```js
// src/domain/astronomy.js (Phase 1 implementation)
import * as Astronomy from "astronomy-engine";

const IAU_TO_ZODIAC = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Cnc: "Cancer",
  Leo: "Leo",   Vir: "Virgo",  Lib: "Libra",  Sco: "Scorpio",
  Oph: "Ophiuchus",
  Sgr: "Sagittarius", Cap: "Capricorn", Aqr: "Aquarius", Psc: "Pisces",
};

function eclipticFallbackConstellation(eclipticLongitudeDeg) {
  // Convert ecliptic (lat=0, lon) → equatorial (RA, Dec)
  const { ra, dec } = eclipticToEquatorial(eclipticLongitudeDeg, 0);

  // astronomy-engine's IAU constellation lookup
  const c = Astronomy.Constellation(ra, dec);

  return IAU_TO_ZODIAC[c.symbol] ?? "Unknown";
}
```

### Boundary table (built once at build time)

For runtime efficiency and deterministic ecliptic-point labels, we sample the ecliptic at 0.01° resolution at build time, find each constellation transition, and ship a small JSON lookup:

```js
// scripts/build-zodiac-boundaries.js — runs at npm build
import { eclipticFallbackConstellation } from "../src/domain/astronomy.js";
import { writeFileSync } from "node:fs";

const boundaries = [];
let prev = null;

for (let lon = 0; lon < 360; lon += 0.01) {
  const sign = eclipticFallbackConstellation(lon);
  if (sign !== prev) {
    boundaries.push({ sign, startDeg: Number(lon.toFixed(2)) });
    prev = sign;
  }
}

writeFileSync(
  "src/domain/zodiac-boundaries.json",
  JSON.stringify(boundaries, null, 2),
);
```

Expected output (approximate; verify against build run):

```json
[
  { "sign": "Aries",       "startDeg": 28.0 },
  { "sign": "Taurus",      "startDeg": 53.5 },
  { "sign": "Gemini",      "startDeg": 90.4 },
  { "sign": "Cancer",      "startDeg": 118.2 },
  { "sign": "Leo",         "startDeg": 138.2 },
  { "sign": "Virgo",       "startDeg": 174.0 },
  { "sign": "Libra",       "startDeg": 218.0 },
  { "sign": "Scorpio",     "startDeg": 241.0 },
  { "sign": "Ophiuchus",   "startDeg": 248.0 },
  { "sign": "Sagittarius", "startDeg": 266.0 },
  { "sign": "Capricorn",   "startDeg": 302.0 },
  { "sign": "Aquarius",    "startDeg": 328.0 },
  { "sign": "Pisces",      "startDeg": 351.0 }
]
```

Then runtime lookup is binary search — O(log 13) — trivial.

## Boundary convention

Where one IAU constellation polygon ends and the next begins, *on the ecliptic line*, there is a single point of transition. The fallback convention is **first-crossing**: a constellation owns ecliptic longitudes from the moment the ecliptic enters its IAU polygon, until the moment it leaves.

Alternative conventions (worth documenting in case we want to compare):

- **Centroid-time**: ecliptic longitudes belong to the constellation the ecliptic spends most time in within some window. Smoother, but harder to define rigorously.
- **MTZ midpoint**: take the IAU boundary intersection lines on either side and use their midpoint on the ecliptic. This is what Mastering the Zodiac does for its astrology zodiac dates.

We keep first-crossing because it is the simplest rigorous fallback for ecliptic-only points. Method copy should disclose the split: physical bodies use observer-sky IAU containment; ecliptic points use the documented boundary fallback.

## Validation

Two regression checks must pass before this is considered correct:

### 1. Sanity check against public true-sky date tables
Compare the generated Sun ingress dates against at least one public true-sky sidereal date table as a broad fallback sanity check. MoonTurtle's physical-body labels should still be verified through observer-sky IAU containment, not copied third-party boundary data.

### 2. Seed-user regression
Run `computeNatal()` against the seed users in `docs/seed-users.md`:

- **Tyler** (13 Apr 1989, 13:55, Tauranga): Sun must come out **Pisces**. If it returns Aries, ayanamsa is wrong or the convention is broken.
- **Ali** (23 Jun 1983, 17:58, Melbourne): Sun must come out **Gemini**. This is the diagnostic case because the tropical Cancer date sits near our Gemini boundary on the IAU map.

All other body placements should match the seed-users tables within ±1°.

## What this doesn't try to do

- **Precession correction across millennia.** astronomy-engine handles precession via standard IAU 2006 models. We assume the IAU boundaries (defined 1930, fixed) drift with respect to the stars over centuries; this is a known property of using fixed boundaries and is fine for daily reading purposes.
- **Different astrology boundary conventions.** First-crossing is our fallback default. If we ever want MTZ-midpoint or centroid-time for ecliptic points, swap one function and rebuild the table.
- **Houses.** This file is signs only. Houses are computed separately. Evaluate `celestine` first for Placidus; use `circular-natal-horoscope-js` only as a fallback if verification fails.
