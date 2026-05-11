# Seed users

Two real users. Both are voice-calibration exemplars and astronomical regression fixtures. **Every astronomy change must pass for both.**

---

## Tyler Priest

**Birth**
- Date: 13 April 1989
- Time: 1:55 PM (NZST, UTC+12:00 — verify historical DST status)
- Place: Tauranga, Bay of Plenty, New Zealand
- Coordinates: -37.6878, 176.1651

**Currently**
- Manly, Sydney, Australia (-33.7969, 151.2840)

**Expected sidereal placements** (from the existing demo `src/data.js` — these are what Phase 1 astronomy.js must reproduce within ±1° before any other work proceeds)

| Body | Sign | House |
|---|---|---|
| Sun | Pisces | 9 |
| Moon | Gemini | 12 |
| Mercury | Aries | 10 |
| Venus | Pisces | 9 |
| Mars | Taurus | 11 |
| Jupiter | Taurus | 11 |
| Saturn | Sagittarius | 6 |
| Uranus | Sagittarius | 6 |
| Neptune | Sagittarius | 6 |
| Pluto | Libra | 4 |
| Chiron | Gemini | 12 |
| North Node | Aquarius | 8 |
| South Node | Leo | 2 |
| **Ascendant** | **Gemini** | — |
| **Midheaven** | **Aries** | — |

**Spica check:** Tyler's Sun must come out Pisces sidereal. If your implementation returns Aries, ayanamsa is not being subtracted.

**Houses:** Whole-Sign (matches the integer house numbers above).

**Voice exemplar:** Tyler's full reading is currently hard-coded into `src/data.js` and will be used verbatim as the `<exemplar>` block in `src/reading/prompt/05-exemplars.md`. See `MT_DATA.primary`, `MT_DATA.activations`, `MT_DATA.lunarAxis`, `MT_DATA.notice`, `MT_DATA.avoid` for the reference prose.

---

## Ali Sunflowers

**Birth**
- Date: 23 June 1983
- Time: 17:58 (AEST, UTC+10:00 — verify historical DST status)
- Place: Melbourne, Victoria, Australia
- Coordinates: -37.8136, 144.9631

**Currently**
- Sydney, Australia (-33.8688, 151.2093)

**Expected sidereal placements** — **TODO before Phase 1**. Cross-check against masteringthezodiac.com or a Vedic calculator and fill this table before writing astronomy tests.

| Body | Sign | House |
|---|---|---|
| Sun | _Cancer (tropical) → likely Gemini sidereal (verify)_ | |
| Moon | _verify_ | |
| Mercury | _verify_ | |
| Venus | _verify_ | |
| Mars | _verify_ | |
| Jupiter | _verify_ | |
| Saturn | _verify_ | |
| Uranus | _verify_ | |
| Neptune | _verify_ | |
| Pluto | _verify_ | |
| Chiron | _verify_ | |
| North Node | _verify_ | |
| Ascendant | _verify_ | |
| Midheaven | _verify_ | |

**Voice exemplar:** Phase 2. Generate Ali's first reading from Phase 1 output, then hand-edit to the user's taste, then commit as the second `<exemplar>` block in `src/reading/prompt/05-exemplars.md`.

---

## Regression test

Both users live in `src/seed/{tyler,ali}.js`. The astronomy unit tests do:

```js
import { tyler, ali } from "../seed";
import { computeNatal } from "../domain/astronomy";

for (const u of [tyler, ali]) {
  const chart = computeNatal(u.birth);
  for (const expected of u.expectedPlacements) {
    expect(chart.bodies[expected.body]).toMatchObject({
      sign: expected.sign,
      house: expected.house,
    });
  }
}
```

If either user fails, do not ship.
