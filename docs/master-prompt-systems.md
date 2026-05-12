# Master Prompt — Multi-System Astrology & Symbolic Profile

The user's **second** master prompt, pasted 11 May 2026. Where `docs/master-prompt.md` is for daily readings inside a single true-sky sidereal framework, this prompt produces a **profile reading** that triangulates across multiple astrology / symbolic traditions and synthesizes the repeating themes.

This is a different product surface from the daily MoonTurtle UI:
- The daily reading is **one chart, one day, in one voice** — distilled into the curated 5-section UI.
- The multi-system profile is **one person, many lenses, one synthesis** — a one-time deep reading.

If MoonTurtle eventually adds a profile feature (potential Phase 3+), this is its prompt.

---

## The prompt (verbatim)

> *Prompt — different astrology systems summary for my friend*
>
> I want a multi-system astrology and symbolic profile for my friend.
>
> Use the details below and tell me what different astrology systems say about them. I do not want a general history of astrology or long cultural explanations. I want a practical, reflective reading of the person through each system, then a final synthesis of the repeating themes.

### Friend's details

- Name: [insert name]
- Date of birth: [day / month / year]
- Exact birth time: [insert time, or say unknown]
- Birth location: [city/suburb, region, country]
- Current location, if relevant: [city/suburb, region, country]
- Relationship to me: [friend / partner / crush / ex / family / etc.]
- Current focus, optional: [love / career / emotional clarity / purpose / healing / general]

Please use day and month clearly when giving dates.

If the birth time is unknown, do not overstate Ascendant, houses, Midheaven, or anything time-sensitive. If you cannot calculate something accurately, say so rather than inventing it.

### What I want

Give me summaries of what each system says about this person.

#### 1. True-sky sidereal astrology
Use MoonTurtle's true-sky sidereal / visible constellation framework if possible: physical bodies by observer-sky IAU constellation containment, ecliptic points by documented boundary fallback, with actual visible constellations and unequal sign lengths.

Summarize their: true-sky Sun · true-sky Moon · Ascendant (if birth time known) · Midheaven (if birth time known) · main chart pattern · emotional nature · communication style · relationship pattern · life direction · core gift · core shadow · one-sentence soul pattern.

#### 2. Modern Western tropical astrology
Give their tropical Western chart summary. Explain how this version describes their identity · emotional style · love style · public path · personality · main strengths · main challenges. Synthesize, don't list placements.

#### 3. Vedic / Jyotiṣa astrology
Use a standard sidereal Vedic framework (Lahiri) if possible. Summarize Moon sign and emotional/mind nature · Ascendant (if birth time known) · Sun sign · nakshatra (if calculable) · life path or dharma themes · emotional needs · strengths and challenges. If you cannot calculate nakshatras or houses accurately, say so.

#### 4. Lunar-cycle astrology
If current location and current date are available, bring in today's Moon. Tell me what phase · what sign/constellation · waxing or waning · what today's Moon may activate for this person · what they are being asked to feel, release, integrate, begin, or ground. If you cannot calculate the current Moon for them, give a general lunar-cycle reading based on their natal Moon.

#### 5. Chinese astrology
Use their birth year and, if possible, the correct Chinese lunar year boundary. Summarize their Chinese zodiac animal and element. Explain temperament · instincts · strengths · social style · relationship tendencies · life rhythm. If birth month/day falls near Chinese New Year, check carefully before assigning the animal.

#### 6. Numerology
Calculate Life Path number · Birthday number · any major repeating numbers. Explain life lesson · personality pattern · leadership style · emotional pattern · challenge · gift.

#### 7. Elemental synthesis
Summarize their overall balance of Fire · Earth · Air · Water using all systems where relevant. Explain which element is strongest · which may be under-supported · what this means emotionally, relationally, physically, and spiritually · what kind of grounding or balance they need.

#### 8. Love and relationship pattern
Using all available systems, summarize how they love · what they need to feel safe · how they communicate affection · what they are attracted to · what scares them in intimacy · what patterns they may repeat · what kind of partner/friendship dynamic supports their growth · what drains them · what their relationship medicine is.

#### 9. Where the systems agree
**This is very important.** After reading each system separately, tell me what themes repeat. For example: sensitivity · independence · spirituality · leadership · emotional privacy · intensity · need for grounding · need for freedom · relationship lessons · communication gifts · creative or public path. Give the core repeating themes.

#### 10. Where the systems differ
Briefly explain where the systems describe them differently. Don't treat one system as the only truth. Compare them.

#### 11. Final combined picture

End with a clear synthesis:

- who this person is at their core
- what they are here to learn
- their main gift
- their main shadow
- their relationship pattern
- what supports their growth
- what they should stop carrying
- what kind of life they are being asked to grow into

Make the final section beautiful, practical, and specific.

### Closing structure (exact headings)

- **Core sentence** — one memorable sentence that captures the person.
- **Main gift** — their strongest gift.
- **Main lesson** — their main growth lesson.
- **Love pattern** — one paragraph.
- **What they need most** — the kind of support, structure, relationship, or practice that helps them thrive.
- **Final mantra** — one short mantra that fits the combined reading.

> Please make the answer deep, personal, and synthesized. Avoid generic horoscope language. Do not over-explain astrology theory. Just give me the reading.

---

## How this prompt fits MoonTurtle

This is **not** a daily-reading prompt. It produces a multi-system profile — a one-time deep reading triangulated across traditions. The daily MoonTurtle UI does not surface this.

If MoonTurtle adds a profile feature (Phase 3+ candidate):
- New screen: `src/ui/screens/ProfileScreen.jsx`
- New endpoint: `functions/api/profile.js`
- New prompt directory: `src/profile/prompt/` (parallel to `src/reading/prompt/`)
- The astronomy backend already produces sidereal data; this prompt also needs tropical, Vedic-Lahiri, lunar-current, Chinese-zodiac (year boundary check), and numerology — most computable client-side from the same birth data.

## Systems considered for inclusion (suggested additions)

See `docs/additional-systems.md` for a curated set of systems not in the current 8, with reasoning for inclusion or exclusion.
