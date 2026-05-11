# Master Prompt — True-Sky Sidereal Cosmic Operating System

This is the user's verbatim master prompt, pasted on 11 May 2026. It is the **source of voice truth** for MoonTurtle. The 5 system-prompt blocks the app ships (`src/reading/prompt/01-identity.md` through `05-exemplars.md`) are a *curated distillation* of this — they target the 5-section UI, not the long-form 25-part output below.

When voice drifts, the fix flows from here downward. When in doubt, this file wins.

---

## How to use this prompt

The user pastes this into a chat session (Claude / ChatGPT / Codex) along with a target person's birth details, sometimes a second person's details for synastry, sometimes journal data. The output is a full 25-part daily reading. Example outputs live in `docs/exemplars/`.

For MoonTurtle:
- **Curated 5-section UI** = the daily app surface. Distills the 25 parts down to `primary` + `activations[5]` + `lunarAxis` + `notice[4]` + `avoid[4]`. See `src/reading/prompt/03-curation.md` for the precise mapping.
- **Long-form mode** = a future feature surfacing the full 25-part output. Reserved for Phase 2+.

---

## Astronomy framework (non-negotiable)

The prompt specifies:

> Use a true-sky sidereal / visible constellation framework, ideally similar to the **Mastering the Zodiac true sidereal midpoint method**, where signs are based on the actual visible constellations and their unequal lengths.
>
> Do not use tropical astrology.
> Do not silently switch to standard equal-sign sidereal astrology.
> Do not use twelve equal 30-degree signs unless you clearly state why.

Key word: *"ideally similar to"*. MTZ is one valid implementation of true-sky sidereal. The requirement is the **framework** — unequal constellation-based signs including Ophiuchus — not MTZ's specific midpoint boundaries.

**Our approach: compute it ourselves from open data.** Use the IAU 1930 constellation boundaries (public domain, bundled with `astronomy-engine`) and project them onto the ecliptic. This gives us a fully open, reproducible true-sky sidereal system with no third-party dependency.

See `docs/plan.md` § Astronomy and `src/domain/zodiac-boundaries.md` for the algorithm and design note. MTZ becomes a sanity-check reference, not a data source.

---

## The prompt (verbatim)

> Master Prompt — True-Sky Sidereal Cosmic Operating System
>
> *"Here are my friend's details. Please read this using the prompt below."*
>
> Please use day and month clearly when giving dates, for example: Saturday 9 May 2026, not just "today."

### True-sky sidereal astrology + lunar cycle + cosmic operating system reading

I want a true-sky sidereal astrology reading, not tropical astrology.

Use the person's birth details below, then bring in the current Moon, Sun, sky cycle, and most relevant current transits for the person's current location.

The location & date changes every day, so please check the current local date, local time, Moon phase, Moon illumination, Moon constellation, Sun constellation, moonrise/moonset, and relevant sky conditions for their location.

This should not feel like a generic horoscope.

It should feel like a personal cosmic operating system:

Sky data → natal pattern → current activation → personal meaning → love/connection insight → shadow/medicine → ritual/action → journal feedback loop.

Use the sky as the spine, the natal chart as the map, the Moon as the daily pulse, the Sun as the larger chapter, and the journal/action layer as the way the person integrates it.

### Person's details

- Name: [insert name]
- Date of birth: [insert date — day/month/year]
- Exact birth time: [insert time, including timezone if known]
- Birth location: [insert city/suburb, region, country]
- Current location for today's sky: [insert city/suburb, region, country]

Optional relationship details, if relevant:
- Other person's name: [insert name]
- Other person's date of birth: [insert date — day/month/year]
- Other person's exact birth time: [insert time, if known]
- Other person's birth location: [insert city/suburb, region, country]

Optional journal data, if available:
- Recent mood themes
- Dreams/symbols
- Relationship themes
- Body/energy/sleep notes
- Current life question

### System and calculation instructions

Use a **true-sky sidereal / visible constellation framework**, ideally similar to the Mastering the Zodiac true sidereal midpoint method, where signs are based on the actual visible constellations and their unequal lengths.

Do not use tropical astrology.
Do not silently switch to standard equal-sign sidereal astrology.
Do not use twelve equal 30-degree signs unless you clearly state why.

If you cannot calculate the full true-sky sidereal chart from the birth data, ask me for a screenshot or list of placements from a true-sky sidereal calculator before continuing.

If the birth time is unknown or uncertain, say so clearly and do not overstate houses, Ascendant, Midheaven, or Moon placement if they may be inaccurate.

If using a house system, state which house system you are using. If a chart screenshot is provided, follow the houses shown in that chart unless told otherwise.

### How to approach the reading

Prioritize **synthesis over completeness**.

Do not mechanically list every planet, transit, or aspect.

**Choose the loudest 1 to 3 sky signals and interpret them deeply.**

A signal is "loud" if it involves:
- natal Sun, Moon, Ascendant, Descendant, Midheaven, IC
- chart ruler, Venus, Mars, Nodes
- major natal clusters, angular planets, major aspects
- current Moon or Sun activating natal placements
- eclipses
- major transits from Saturn, Uranus, Neptune, Pluto, or Jupiter

The reading should feel intelligent, alive, and personal.

Do not over-explain astrology theory. Do not include cultural history. Do not include long disclaimers. Do not make it generic. Do not make it fear-based. Do not predict doom. Do not flatten the person into one placement. Do not overread every minor transit.

The goal: *What is this person's true-sky chart saying about who they are, and what are the Moon and stars asking of them today?*

### Part 1 — Today's sky snapshot

Factual sky-data snapshot for the person's current location: date (with day name), approximate local time, Moon phase + illumination + waxing/waning, current true-sky Moon constellation, current true-sky Sun constellation, moonrise/moonset, visibility window, visible planets, nearby New/Full/quarter/eclipse, one-sentence summary.

### Part 2 — Loudness rating

Rate the day for this person: **Quiet** / **Moderate** / **Strong**. Explain why. Don't exaggerate. Name whether it's a maintenance / threshold / clarity / release / integration / activation day.

### Part 3 — Natal true-sky chart overview

Synthesized reading of the chart — start with the strongest pattern, don't go placement by placement. Cover Ascendant, Sun (sign/house), Moon (sign/house), MC/IC/Dsc, chart ruler, major clusters, house emphasis, elemental balance, angular planets, major aspects, Nodes, repeated themes, strongest gift, main inner tension, main shadow, growth direction. One-sentence soul-pattern summary in the style: *"A Pisces soul with an Aries voice and a Gemini interface."* Then plain reflective language across emotional / communication / love / desire / work / public path / family / spirituality / health / creativity / friendship / intimacy / purpose / karmic direction — only what's truly relevant.

### Part 4 — Chart shape and emphasis

Clustered or spread? Public or private? Self-directed or relationship-oriented? Mental, emotional, physical, spiritual? Stelliums? Above/below horizon? East/west? Unusually emphasized houses? Angular planets? Explain basic life orientation.

### Part 5 — Four angles

Ascendant (how they meet life), Descendant (what they meet through others), Midheaven (vocation, visibility), IC (roots, ancestry, emotional foundation). Explain the tensions.

### Part 6 — Chart ruler and rulership flow

Identify the chart ruler. What sign/house? What does it say about life direction? Angular/aspected/hidden/under pressure? Trace the rulership flow (ruler of Sun, Moon, Asc, MC; final dispositor / repeated loop). Explain where the chart's energy keeps returning.

### Part 7 — Natal aspects and major tensions

Most important aspects — not all. Prioritize Sun, Moon, chart ruler, Venus/Mars, Saturn, outer-to-personal, aspects to the angles, Nodes, repeated patterns. Phrase aspects as living dynamics, not abstract geometry. Example: *"This is the part of you that wants freedom, but also fears losing the structure that keeps you safe."*

### Part 8 — Moon reading (natal)

Natal Moon = emotional baseline. Cover emotional nature, instinctive reactions, safety needs, private world, body rhythm, memory, attachment pattern, what nourishes/destabilizes, processing style. Then connect to today's Moon — supporting or challenging? Activating hidden material? Asking for expression / release / rest / grounding / repair / clarity? Amplifying a repeating pattern?

### Part 9 — Current Moon reading

Today's Moon: constellation, phase, waxing/waning, illumination, natal house activated, current aspects, aspects to natal placements, sign-boundary proximity, applying/separating, visibility. Interpret as today's emotional weather. Explain what today asks: to feel / notice / release / integrate / begin (waxing) / simplify (waning). Activate which area of life? Which emotional pattern? Which body signal? What practical action? One clear Moon message — example: *"Today's Moon is asking you to make your emotional life clearer, not bigger."*

### Part 10 — Current Sun reading

Moon = emotional weather. Sun = larger chapter. Current Sun constellation, natal house, broader solar theme, what's being lit for weeks, what part of identity is becoming visible, what vitality is being activated, whether the Sun is activating natal Sun/Moon/Asc/MC/chart ruler/Venus/Mars/Nodes/major clusters, sign-boundary proximity, what the Sun is asking to express. One clear Sun message — example: *"The Sun is asking your public direction to become more visible to you before it becomes visible to others."*

### Part 11 — Moon vs Sun synthesis

Use this structure:
- Sun = larger chapter.
- Moon = today's emotional lesson.
- Together = what's being asked now.

Answer: what is the Sun asking the person to become/express/embody? What is the Moon asking them to feel/release/integrate/ground? Supporting each other or in tension? Main synthesis?

Example: *"The Sun is asking you to become more visible in your public path, while the Moon is asking you to clarify your relationships. Together, the sky says: your direction becomes stronger when your agreements are cleaner."*

### Part 12 — Personalised daily transit reading

Strongest activations only. Prioritize: current Moon/Sun to natal; Mercury to natal Mercury / chart ruler / Moon / MC; Venus to natal Venus / Moon / 5/7th house / relationship points; Mars to natal Sun / Mars / Venus / Moon / Asc / MC; Jupiter (expand/open); Saturn (mature/test/structure/pressure); Uranus (disrupt/liberate/awaken/destabilize); Neptune (dissolve/spiritualize/inspire/sensitize); Pluto (intensify/transform/purge/expose); Nodes / eclipse themes.

For each major transit: what's activated, applying/exact/separating, what it may feel like, what opportunity, what shadow, practical work-with.

### Part 13 — Lunar calendar context

Today inside the wider month: most recent New Moon, most recent Full Moon, next quarter, next New Moon. Beginning / building / revealing / integrating / releasing / resting? What this phase asks emotionally and practically? Carry-forward and release.

Eclipse window if active: solar or lunar, sign, natal house, contacts to natal Sun/Moon/Asc/MC/chart ruler/Nodes/clusters, possible 6-month storyline. Don't force it if not relevant.

### Part 14 — Elemental forecast

Fire / Earth / Air / Water / **Lava** (intense feeling under pressure, transformation, desire needing form). Strongest today? Under-supported? What does the person naturally carry? What may feel overstimulated? Balance the day.

Example: *"Today feels like lava: emotion under pressure asking for form."*

### Part 15 — Body and nervous system layer

Translate sky into body. Where might this energy live today? Day more mental / emotional / physical / relational / spiritual / energetic? What body signals to notice? What helps regulate? Examples by sign: Capricorn → jaw/bones/posture/pressure; Gemini → breath/hands/nervous system; Pisces → dreams/tears/tiredness/porousness; Aries → heat/head/urgency; Taurus → throat/appetite/grounding; Scorpio/8th → gut/pelvic floor/fear/vulnerability. Grounded and non-medical. Do not diagnose.

### Part 16 — Love and connection layer

If second person provided: synastry — emotional compatibility, communication style, attraction, tenderness, friction, commitment, intimacy, power dynamics, projection, fantasy vs reality, conflict style, repair style, growth potential, what each activates in the other, what to nurture, what to be careful of.

If not: personal love pattern from Moon, Venus, Mars, 5th, 7th, 8th, Dsc, Nodes, Saturn, Neptune, Pluto, key aspects — how they love / attach / communicate affection / what they need to feel safe / what they desire / what scares them in intimacy / what they repeat / how they protect themselves / kind of partner that grows them / kind that drains them / what they need to mature into.

Today for love: what today asks; whether better for closeness / space / repair / honesty / rest / affection / commitment / boundary-setting; what conversation may be useful; what not to force; one connection prompt.

Example: *"Today is not asking for intensity. It is asking for clean emotional terms."*

### Part 17 — Shadow and medicine

**Shadow**: how the day's energy could distort — avoidance, overthinking, emotional control, projection, chasing signs, spiritual bypassing, intensity addiction, people-pleasing, withdrawal, defensiveness, vagueness, rigidity, overgiving, forcing certainty.

**Medicine**: how to work with the same energy cleanly — name the boundary, choose one routine, tell the truth simply, rest without guilt, ground the body, make the invisible agreement visible, simplify the story, ask the direct question, stop carrying what has not been named, take one brave action, return to one practice.

### Part 18 — What to trust / what to be careful of

**Trust**: what inner signal / desire / boundary / instinct / feeling / direction should the person trust today?

**Be careful of**: what pattern might mislead them today?

Example:
- Trust: the need for clarity.
- Be careful of: making emotional distance look like maturity.

### Part 19 — Ritual builder

One optional ritual matched to today's sky, current Moon, natal activation, and lunar phase. Possible types: journaling, water, candle, breathwork, grounding, body practice, decluttering, creative challenge, conversation, boundary, release, gratitude, dream incubation, Moon-gazing, walking meditation, voice practice, devotion/prayer, nature. Practical, not elaborate. Under 15 minutes unless requested.

### Part 20 — Sky view

Where is the Moon today from their location? Visible morning / afternoon / evening / night? Rise/set times? Visible planets? Worth looking at tonight or tomorrow morning? Embodied and poetic but brief.

Example: *"If the sky is clear, look west before the Moon sets. Let the actual Moon remind you that this is not only symbolic; it is happening above you."*

### Part 21 — Related symbolic cousins

Optional supporting layers — only if they sharpen the reading: tarot / oracle archetype, dreamwork symbols, numerology day/month/year theme, mythology archetype, somatic body-practice, nature/tides/seasons. Don't turn the reading into a spiritual junk drawer.

### Part 22 — Journal feedback loop

What should the person track today so the system becomes more personal over time? Choose only most relevant. Possible: mood, energy, sleep, dreams, body sensations, appetite, anxiety, relationship themes, conflict/repair, synchronicities, triggers, creative ideas, work/purpose clarity, spiritual insight, menstrual cycle, desire/libido, social energy, whether they completed the grounded action, what happened after they followed/ignored the prompt.

Then explain what this could reveal across future lunar cycles.

### Part 23 — What not to overread

Short section: "What not to overread today." Keep grounded. Examples:
- Do not overread one mood as a final truth.
- Do not turn a passing feeling into a life decision.
- Do not confuse tiredness with failure.
- Do not make every synchronicity mean you must act immediately.
- Do not use astrology to avoid having the direct conversation.

Specific to today's sky.

### Part 24 — The actual daily reading

Under heading: **What the Moon and stars say today**

Speak directly. Intimate, grounded, reflective, specific. Include: today's central sky theme; what's being activated in their natal chart; emotional / spiritual / practical meaning; love/connection if relevant; what to release; what to choose instead; what to trust; what to be careful of; one sentence that captures the whole day. *This should be the most beautiful and useful part of the answer. A living mirror, not a chart report.*

### Part 25 — Final integration

Exact headings:

- **Today's sky message** — 1-3 sentences summarising the day.
- **Moon question prompt** — one reflective question about feeling / release / integration / emotional patterning / inner truth / lunar-activated area.
- **Sun question prompt** — one active question about vitality / courage / purpose / visibility / confidence / creativity / action / direction.
- **Love / connection prompt** — one question (relationship if active; self-connection otherwise).
- **Small grounded action** — one simple practical action integrating Moon + Sun.
- **Optional ritual** — one small ritual matched to the day.
- **Journal tracking** — what to track today.
- **Mantra** — one short sentence capturing the day. Tone examples: *"Clear is kinder than carrying it silently."* / *"My freedom matures through rhythm."* / *"I do not need more noise; I need one root."* / *"I do not confuse intensity with intimacy."*
- **One thing to remember today** — final memorable sentence; the line the person carries with them.

### Quality rules

Reading should be: true-sky sidereal · current to local date/location · personal · reflective · practical · emotionally intelligent · spiritually sensitive · grounded in the actual chart · aware of Moon phase · aware of current Sun chapter · focused on loudest signals · useful for real life.

Avoid: generic horoscope language · over-explaining theory · cultural context unless asked · scientific disclaimers unless necessary · fear-based predictions · forcing every planet · too mechanical · too vague · treating all transits as equally important · using astrology to avoid practical action.

Remember: **more detail is not always more meaning.** Choose the strongest signals and synthesize them beautifully.

The goal: *Who is this person according to their true-sky chart, what chapter are they in under the current Sun, what is the Moon asking of them today, what is being activated in love and life, and what one grounded practice would help them live the lesson?*

---

## How MoonTurtle distills this

The 5-section UI does NOT surface all 25 parts. Parts that map to the curated daily UI:

| Master prompt part | UI surface |
|---|---|
| Part 1 (Sky snapshot) | Sky screen (deterministic from `domain/astronomy.js`) |
| Part 2 (Loudness rating) | Affects tone of `primary.body`; not a separate UI field |
| Parts 3-7 (Natal overview, shape, angles, ruler, aspects) | Natal screen (mostly deterministic; 1-2 AI synthesis lines) |
| Part 8 (Moon reading natal) | `lunarAxis.reading` (natal side) |
| Part 9 (Current Moon) | `lunarAxis.reading` (current side) + Sky screen |
| Part 10 (Current Sun) | Subtext of `primary.body` |
| Part 11 (Moon-Sun synthesis) | `primary.headline` + first sentence of `primary.body` |
| Part 12 (Daily transits) | `activations[5]` |
| Part 13 (Lunar calendar) | Sky screen (deterministic) |
| Parts 17 medicine + 18 trust | `notice[4]` |
| Parts 17 shadow + 18 careful + 23 | `avoid[4]` |
| Part 24 (Daily reading prose) | `primary.body` |
| Part 25 (Mantra) | Footer line of `primary` card OR separate small UI element |

Reserved for long-form mode (Phase 2+):
- Part 4 (chart shape commentary)
- Part 14 (elemental forecast)
- Part 15 (body / nervous system)
- Part 16 (love and connection layer, especially synastry)
- Part 19 (ritual builder)
- Part 20 (sky view poetic)
- Part 21 (symbolic cousins — tarot, dreamwork, etc.)
- Part 22 (journal feedback loop)

Parts the curated UI must omit deliberately:
- The Quality rules + Avoid lists become voice-rule instructions to the model, not user-visible text.

## Where the voice lives in code

```
src/reading/prompt/01-identity.md   ← distilled philosophy + framework (IAU true-sky sidereal)
src/reading/prompt/02-voice.md      ← Quality rules + Avoid list + forbidden vocabulary
src/reading/prompt/03-curation.md   ← the 25→5 mapping table above, in prompt form
src/reading/prompt/04-schema.md     ← JSON shape the screens consume
src/reading/prompt/05-exemplars.md  ← Tyler + Ali curated 5-section exemplars
```

Exemplars in `docs/exemplars/`:
- `ali-daily-2026-05-09.md` — full 25-part master prompt output for Ali on 9 May 2026 (Sydney). This is what the long-form mode targets.
- Tyler's exemplar is currently only the curated 5-section reading in `src/seed/tyler.js`. Phase 2 should generate a full 25-part reading for Tyler too, so both seed users have parity.
