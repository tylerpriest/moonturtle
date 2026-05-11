# Seed users

Two real users. Both are voice-calibration exemplars and astronomical regression fixtures. **Every astronomy change must pass for both.**

**Astronomy framework:** true-sky sidereal midpoint (Mastering the Zodiac), Placidus houses. NOT Lahiri ayanamsa with equal 30° signs. The placements below are MTZ-method placements; equal-sign sidereal calculations may differ by 1-3° at sign boundaries. See `docs/master-prompt.md` § "Astronomy framework" for the open task on which library/approach to adopt.

---

## Tyler Priest

**Birth**
- Date: 13 April 1989
- Time: 13:55
- Timezone: NZST (UTC+12, no DST in April 1989)
- Place: Tauranga, Bay of Plenty, New Zealand (-37.6878, 176.1651)

**Currently:** Manly, Sydney, Australia (-33.7969, 151.2840)

**Expected sidereal placements** (true-sky / MTZ — from existing demo data; Phase 1 astronomy must reproduce within ±1°)

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

**Spica check:** Tyler's Sun must come out Pisces sidereal. If your implementation returns Aries, ayanamsa is not being applied / MTZ boundaries not respected.

**Voice exemplar:** Tyler's full curated 5-section reading is hard-coded into the current `src/data.js`. After the Phase-0 restructure it becomes `src/seed/tyler.js` and is referenced verbatim as the first `<exemplar>` block in `src/reading/prompt/05-exemplars.md`.

Phase 2 TODO: generate a full 25-part master prompt output for Tyler matching today's date and Manly Sydney, to give exemplar parity with Ali.

---

## Ali Sunflowers

**Birth**
- Date: 23 June 1983
- Time: 17:58
- Timezone: AEST (UTC+10, no DST in Victoria in winter)
- Place: Melbourne, Victoria, Australia (-37.8136, 144.9631)

**Currently:** Sydney, NSW, Australia (-33.8688, 151.2093)

**Expected sidereal placements** (true-sky midpoint / MTZ, Placidus houses — confirmed from the canonical reading at `docs/exemplars/ali-daily-2026-05-09.md`)

| Body | Sign | House | Notes |
|---|---|---|---|
| Sun | Gemini | 6 | conjunct Mars, North Node; trine Saturn-Pluto; opposite Neptune |
| Moon | Scorpio | 11 | conjunct Uranus + Jupiter; opposite Mercury |
| Mercury | Taurus | 6 | opposite natal Moon |
| Venus | Leo | 8 | currently squared by transiting Sun |
| Mars | Taurus | 6 | conjunct natal Sun + North Node |
| Jupiter | Scorpio | 11 | **chart ruler** (Sagittarius rising); retrograde |
| Saturn | Virgo | 10 | conjunct natal Pluto |
| Uranus | Scorpio | 11 | conjunct natal Moon + Jupiter |
| Neptune | Sagittarius | 12 | opposite natal Sun |
| Pluto | Virgo | 10 | conjunct natal Saturn |
| North Node | Taurus | 6 | growth direction: embodiment, daily rhythm |
| South Node | Scorpio | 12 | (implied) |
| **Ascendant** | **Sagittarius** | — | chart ruler = Jupiter |
| **Descendant** | **Gemini** | — | |
| **Midheaven** | **Virgo** | — | |
| **IC** | **Pisces** | — | |

**Distinguishing checks for Ali:**
- Sun sidereal Gemini (tropical Cancer — boundary case; verify MTZ midpoint puts late June in Gemini)
- Ascendant Sagittarius (depends on confirmed 17:58 AEST)
- Jupiter is the **chart ruler** — should be flagged as such in the natal output
- The Scorpio 11th-house stellium (Moon + Jupiter + Uranus) is the dominant emotional signature

**Voice exemplar:**
- Daily long-form: `docs/exemplars/ali-daily-2026-05-09.md` (full 25 parts, Saturday 9 May 2026 in Sydney)

Phase 2 TODO: distill the daily long-form into a curated 5-section JSON exemplar and add as the second `<exemplar>` block in `src/reading/prompt/05-exemplars.md`.

---

## Regression test

Both users are imported into the astronomy unit test:

```js
import { tyler } from "../seed/tyler";
import { ali } from "../seed/ali";
import { computeNatal } from "../domain/astronomy";

for (const u of [tyler, ali]) {
  const chart = computeNatal(u.user.birth);

  for (const expected of u.expectedPlacements.bodies) {
    const computed = chart.bodies.find(b => b.body === expected.body);
    expect(computed.sign).toBe(expected.sign);
    expect(computed.house).toBe(expected.house);
  }

  for (const expected of u.expectedPlacements.angles) {
    const computed = chart.angles.find(a => a.angle === expected.angle);
    expect(computed.sign).toBe(expected.sign);
  }
}
```

**If either user fails, do not ship.** The voice exemplars in the prompt cache assume these placements are correct.
