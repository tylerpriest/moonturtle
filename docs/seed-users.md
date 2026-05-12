# Seed users

Two real users. Both are voice-calibration exemplars and astronomical regression fixtures. **Every astronomy change must pass for both.**

**Astronomy framework:** MoonTurtle true-sky sidereal via actual observer-sky body positions and IAU constellation containment, with documented ecliptic-boundary fallback for nodes, angles, and houses. NOT tropical. NOT Lahiri ayanamsa with equal 30° signs. NOT copied MTZ midpoint boundary data.

The placements below began as prototype/voice fixtures. Phase 1 must recompute them with MoonTurtle's IAU implementation and update this file if a documented convention difference appears near a sign boundary.

---

## Tyler Priest

**Birth**
- Date: 13 April 1989
- Time: 13:55
- Timezone: NZST (UTC+12, no DST in April 1989)
- Place: Tauranga, Bay of Plenty, New Zealand (-37.6878, 176.1651)

**Currently:** Manly, Sydney, Australia (-33.7969, 151.2840)

**Expected sidereal placements** (prototype true-sky fixture — Phase 1 astronomy must reproduce or document any IAU-convention delta)

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

**Spica check:** Tyler's Sun must come out Pisces under MoonTurtle's true-sky sign lookup. If your implementation returns Aries, the actual-sky IAU lookup is wrong or bypassed.

**Voice exemplar:** Tyler's full curated 5-section reading lives in `src/seed/tyler.js` and is referenced verbatim as the first `<exemplar>` block in `src/reading/prompt/05-exemplars.md`.

Phase 2 TODO: generate a full 25-part master prompt output for Tyler matching today's date and Manly Sydney, to give exemplar parity with Ali.

---

## Ali Sunflowers

**Birth**
- Date: 23 June 1983
- Time: 17:58
- Timezone: AEST (UTC+10, no DST in Victoria in winter)
- Place: Melbourne, Victoria, Australia (-37.8136, 144.9631)

**Currently:** Sydney, NSW, Australia (-33.8688, 151.2093)

**Expected sidereal placements** (prototype true-sky fixture, Placidus houses — confirmed from the canonical voice reading at `docs/exemplars/ali-daily-2026-05-09.md`; recompute under MoonTurtle's actual-sky IAU convention in Phase 1)

**IAU correction note, 12 May 2026:** The prototype voice fixture placed Ali's Moon, Venus, and South Node from the earlier calculator/exemplar context. MoonTurtle's actual observer-sky lookup places Ali's Moon in Ophiuchus, Venus in Cancer, and the ecliptic South Node fallback in Ophiuchus. The regression fixture now follows the reproducible MoonTurtle convention rather than the older exemplar prose.

| Body | Sign | House | Notes |
|---|---|---|---|
| Sun | Gemini | 6 | conjunct Mars, North Node; trine Saturn-Pluto; opposite Neptune |
| Moon | Ophiuchus | 11 | actual observer-sky IAU lookup; part of the 11th-house cluster |
| Mercury | Taurus | 6 | opposite natal Moon |
| Venus | Cancer | 8 | actual observer-sky IAU lookup |
| Mars | Taurus | 6 | conjunct natal Sun + North Node |
| Jupiter | Scorpio | 11 | **chart ruler** (Sagittarius rising); retrograde |
| Saturn | Virgo | 10 | conjunct natal Pluto |
| Uranus | Scorpio | 11 | conjunct natal Moon + Jupiter |
| Neptune | Sagittarius | 12 | opposite natal Sun |
| Pluto | Virgo | 10 | conjunct natal Saturn |
| North Node | Taurus | 6 | growth direction: embodiment, daily rhythm |
| South Node | Ophiuchus | 12 | ecliptic-point boundary fallback |
| **Ascendant** | **Sagittarius** | — | chart ruler = Jupiter |
| **Descendant** | **Gemini** | — | |
| **Midheaven** | **Virgo** | — | |
| **IC** | **Pisces** | — | |

**Distinguishing checks for Ali:**
- Sun sidereal Gemini (tropical Cancer — boundary case; verify MoonTurtle's actual-sky IAU convention keeps late June in Gemini)
- Ascendant Sagittarius (depends on confirmed 17:58 AEST)
- Jupiter is the **chart ruler** — should be flagged as such in the natal output
- The 11th-house Scorpio/Ophiuchus cluster (Moon + Jupiter + Uranus) is the dominant emotional signature

**Voice exemplar:**
- Daily long-form: `docs/exemplars/ali-daily-2026-05-09.md` (full 25 parts, Saturday 9 May 2026 in Sydney)

Phase 2 TODO: distill the daily long-form into a curated 5-section JSON exemplar and add as the second `<exemplar>` block in `src/reading/prompt/05-exemplars.md`.

---

## Regression test

Run:

```bash
npm run check:astronomy
```

The script checks Tyler, Ali, the 13-sign fallback table, unknown birth-time behavior, signal reason shape, and runtime tropical-label leakage. **If either seed user fails, do not ship.** If a near-boundary placement differs from an older voice exemplar, update this file with a dated convention note rather than bending the IAU math.
