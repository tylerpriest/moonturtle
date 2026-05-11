# Additional symbolic systems — beyond the eight in the multi-system prompt

The current multi-system prompt covers 8 lenses: true-sky sidereal, tropical, Vedic, lunar-cycle, Chinese, numerology, elemental synthesis, love/relationship synthesis. Here are systems NOT in that list, ranked by fit with the existing audience and the master prompt's voice rules.

## Strong fit — recommend adding

### 1. Human Design
The single most popular complement to astrology in the same audience. Synthesizes Western astrology, I Ching, Kabbalah, chakras, and the Vedic chakra system into a single chart. Computed entirely from birth data (date / time / location), so the existing astronomy backend already produces what's needed.

What it adds that the other 8 systems don't:
- **Type** (Manifestor / Generator / Manifesting-Generator / Projector / Reflector) — practical "how do you make decisions" framing
- **Strategy** + **Authority** — actionable patterns the other systems describe symbolically but don't operationalize
- **Profile** (e.g. 4/6, 1/3) — a "life-role" lens missing from natal Western astrology
- **Defined / Undefined Centers** — body-map of consistent versus conditioned energy

Caveat: Human Design has a controversial origin story (Ra Uru Hu's downloaded transmission). The voice rules need to handle this gracefully — treat HD as a symbolic system like the others, don't validate the metaphysical claims.

### 2. Hellenistic astrology
The original Western system, with techniques that modern tropical astrology lost:
- **Annual profections** — each year of life is "ruled" by a different house, giving a time-based meaning the daily-Moon focus can't provide
- **Zodiacal releasing** — long-term life-chapter timing from Lots (Fortune, Spirit)
- **Lots** — derived points (Lot of Fortune = Asc + Moon − Sun for diurnal charts) that work like additional sensitive points
- **Triplicity rulers** — three rulers per element, giving an early/middle/late life thread
- **Sect** — day chart vs night chart changes which planets are favoured

What this adds: **time-based forecasting**. The current multi-system prompt is mostly "who is this person?" — Hellenistic gives "and what chapter are they in?" without depending on transits.

### 3. Sabian Symbols (or any 360-degree symbol system)
Each of the 360 degrees of the zodiac has a symbolic image (Marc Edmund Jones / Elsie Wheeler, 1925). Look up the symbol for the natal Sun's degree, the Moon's, the Asc, etc.

What this adds: **poetic anchor**. The image is concrete, evocative, and lets the model write metaphor that's anchored in a specific source rather than invented on the fly. Pairs naturally with the master prompt's Part 21 (tarot tone, dreamwork).

No new computation needed beyond what astronomy.js already produces — just a 360-entry lookup table.

### 4. Mayan Tzolk'in (sacred 260-day calendar)
A completely different cultural lens from the European traditions. 20 day-signs × 13 numbers = 260 days. Birth date gives day-sign + galactic tone.

What this adds: **cultural breadth**. The current 8 systems are 5 European (true-sky, tropical, Vedic, lunar, numerology), 1 East Asian (Chinese), and 2 cross-cutting. Adding Mayan gives Indigenous Americas representation and an earth-based / time-quality framing the European systems lack.

Caveat: respectful framing matters. The Tzolk'in is sacred to Maya communities; treat it as one of many lenses, not appropriated decoration.

## Moderate fit — consider adding

### 5. Tarot natal cards (Soul / Personality)
Sum the digits of the birth date, reduce to a Major Arcana number → Soul card and Personality card. Tyler born 13/4/1989: 13+4+1989 = 2006 → 2+0+0+6 = 8 (Strength); reduce further or split differently for the second card.

What this adds: a Tarot lens without requiring a full reading. Pairs with the master prompt's Part 21 tarot tone references. Tiny computation; just a table of 22 Major Arcana cards.

### 6. Saju / Korean Four Pillars (Bazi)
Year / Month / Day / Hour each get a Heavenly Stem + Earthly Branch, giving a 4×2 = 8-character chart with Five-Element interactions. Much more systematic than the year-animal-only Chinese system already in the prompt.

What this adds: **upgrade to Chinese astrology**. If "Chinese zodiac animal" is included, Bazi is the deeper version. Same input data, much richer output.

### 7. Enneagram
Nine personality types. Not chart-based — typically determined via self-report or test, not birth data. Adds a psychological-development frame the astrological systems handle obliquely.

What this adds: a **trustworthy psychological lens** the audience already engages with. Adding it requires user input (questionnaire or self-typed); doesn't fit the "calculate from birth data" pattern of the others.

### 8. Heliocentric astrology
The same chart computed from the Sun's perspective rather than Earth's. The planets sit in different signs/houses. Often framed as "soul purpose" vs "personality."

What this adds: a "soul" lens distinct from the personality reading. Minimal extra computation since astronomy-engine produces heliocentric positions natively.

## Lower fit — note but probably skip

### 9. Fixed stars
Overlay specific bright stars (Spica, Regulus, Algol, Sirius, etc.) onto chart positions. Tyler's sidereal Sun in late Pisces sits near specific fixed stars. Adds depth but is more an *aspect of advanced sidereal practice* than a separate system — it nests inside the sidereal lens already covered.

### 10. Asteroid astrology (Chiron, Lilith, Ceres, Pallas, Juno, Vesta)
Already partially covered: Chiron is in Tyler's chart in the current `data.js`. Lilith / Ceres / Pallas / Juno / Vesta add nuance but are best treated as additional points in the existing chart rather than a separate system.

### 11. Draconic astrology
Chart rotated so the North Node sits at 0° Aries. "Soul intention" vs the personality chart. Niche, but elegant. Same input data; just a rotation.

### 12. Horary / electional astrology
Horary: ask a specific question and read the chart of the moment. Electional: pick a chart-favourable moment for an event. Neither produces a person-profile, so they don't fit the prompt's frame.

## Systems I'd think twice about for a commercial app

- **Akashic Records / past-life readings** — Audience overlap is high, but these are entirely narrative-generated with no falsifiable signal. The master prompt's anti-fatalism rule is hard to honour when the model is inventing a past life.
- **Family Constellations (Hellinger)** — A therapeutic technique, not a profile system. Doesn't fit calculate-from-birth-data.
- **Aboriginal Dreaming / Lakota star knowledge / Polynesian wayfinding astronomy** — Sacred to specific cultures, often closed-source, inappropriate to deploy in a commercial app without partnership or consent. If MoonTurtle ever wants Indigenous frameworks, they should be co-authored or licensed, not extracted.
- **Phrenology / Iridology** — Pseudoscientific and largely discredited. Not in scope.

## My recommendation if expanding the prompt

If you want to grow the multi-system prompt by 2-3 lenses, in priority order:

1. **Human Design** — biggest audience-fit gain
2. **Sabian Symbols** — biggest voice-quality gain (anchors metaphor)
3. **Hellenistic time-lord techniques** — biggest "what chapter are you in?" gain
4. **Mayan Tzolk'in** — biggest cultural-breadth gain

Adding all four would shift the prompt from 8 → 12 lenses. Quality risk: the longer the multi-system reading, the harder it becomes to synthesize. If lenses are added, the "Where the systems agree" section becomes the load-bearing curation step — invest more prompt-engineering there.

## If MoonTurtle adds a profile feature

Suggested layered approach:
- **Free tier** — the existing 8 systems + a single AI-generated synthesis
- **Deep tier** — add Human Design, Sabian symbols, Hellenistic profections
- **Practitioner tier** — full multi-system spread plus the user's chosen specialist lens (Mayan, draconic, etc.)
