# Master Prompt — Daily (short form)

The user's **third** sibling prompt, pasted 11 May 2026. A shorter daily-cadence variant of the main master prompt at `docs/master-prompt.md`. Where the main prompt produces a 25-part long-form reading, this one produces a tight daily reading focused on the loudest 1-3 signals.

This is closer in spirit to what MoonTurtle's curated daily UI surface needs. **The user has flagged it for improvement** — *"Something like this daily but better"* — so treat the verbatim text below as a draft, not a final spec.

---

## The prompt (verbatim, draft)

> Each day, check the most relevant cosmic signals: Moon phase, Moon constellation, Moon house transit, Sun constellation, solar house transit, major aspects, Mercury/Venus/Mars/Jupiter/Saturn transits, Nodes/eclipses, retrogrades, visible planets, elemental balance, body/nervous-system tone, love/connection themes, dreams/symbols, and local sky visibility.
>
> Do not include everything. Choose only the loudest 1–3 signals that interact with my natal chart, especially my Sun, Moon, Ascendant, Midheaven, chart ruler Mercury, Venus, Mars, Nodes, and major natal clusters.
>
> Explain how today's cosmic signals interact with my chart, what they ask me to feel, notice, release, express, or act on, and how I can make today great.

Note: the reference to *"chart ruler Mercury"* indicates this draft was personalised for Tyler (Gemini Ascendant → Mercury rules). For a general prompt the line should read *"chart ruler"* without naming a body.

---

## What "better" looks like (suggested next iteration)

Drawing from what we've learned in this build, the V2 daily prompt should:

### 1. Lock in voice
Inherit the voice rules from `src/reading/prompt/02-voice.md` — Cormorant register, forbidden vocabulary, conditional verbs, image-first.

### 2. Make "loudest" deterministic, not aesthetic
The current draft says "choose the loudest 1-3 signals" but doesn't define loudness. The next version should specify:
- Body weights (Sun/Moon = 10, Mercury/Venus/Mars = 6, etc.)
- Tightness-over-bodies — a 0.5° Saturn transit beats a 7° Jupiter transit
- Angular planets and chart-ruler weighting
- Eclipse / station / ingress override

Better still: compute the ranking deterministically *before* the prompt runs (Signal Engine in `src/engine/signals.js`), and hand the model only the top signals — the prompt becomes "write the reading for THIS signal" instead of "choose what matters and then write."

### 3. Structure the output for the UI
The current draft asks for free-form prose. The MoonTurtle UI needs structured fields:
```
primary.headline + primary.body
activations[5]
lunarAxis { natalSign, currentSign, reading }
notice[4]
avoid[4]
```
The V2 prompt should reflect this. See `src/reading/prompt/04-schema.md`.

### 4. Use the curation table
The main master prompt has 25 parts. The daily curated UI surfaces only some of them. The V2 daily prompt should reference the same curation table at `src/reading/prompt/03-curation.md` so voice stays consistent across daily and long-form modes.

### 5. Bake in the master prompt's quality + forbidden lists
The main prompt has explicit Quality rules and an Avoid list. The daily V2 should include these by reference, not re-derive them.

### 6. Move "how I can make today great" toward "what is today asking"
*"How I can make today great"* edges toward prescription / horoscope register. *"What is today asking you to notice / release / integrate"* keeps the master prompt's reflective frame.

### 7. Add the sidereal framework constraint
The V2 prompt should specify true-sky sidereal (IAU-based, per our open-source approach) — the current draft is framework-agnostic and could be served by tropical.

---

## How this fits MoonTurtle

The V2 daily prompt would replace or supplement the current `src/reading/prompt/01-05` blocks. The likely shape:

- `src/reading/prompt/01-identity.md` — same identity / framework / fallback (already exists)
- `src/reading/prompt/02-voice.md` — same voice rules (already exists)
- `src/reading/prompt/03-curation.md` — same 25→5 mapping (already exists)
- `src/reading/prompt/04-schema.md` — same JSON shape (already exists)
- `src/reading/prompt/05-exemplars.md` — Tyler + Ali curated exemplars (Tyler exists; Ali Phase 2)
- `src/reading/prompt/06-daily-task.md` — **NEW**: the actual "today's task" framing, drawing from this V2 daily prompt

This is the only block that would be *daily-specific*; everything above it is general voice/structure that applies to any reading.
