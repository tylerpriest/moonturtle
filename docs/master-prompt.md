# Master Prompt — True-Sky Sidereal Cosmic Operating System

> **Status:** Placeholder. The user holds the verbatim master prompt and will paste it here before Phase 1 begins. The notes below summarise what was discussed in the planning chat — they are NOT the prompt itself.

## What this is

The user's long-form working prompt, used previously in direct AI chats to generate full-form astrological readings. ~5000 words, 25 numbered parts. It is the **source of voice truth** for MoonTurtle. The system prompt at `src/reading/prompt/*` is a *curation* of this — it folds the 25 parts into the UI's 5 sections (primary, activations, lunarAxis, notice, avoid).

Do not edit MoonTurtle's voice without re-reading this file. Do not paraphrase this file in code; reference it.

## What we know about its content (from the planning chat)

These are second-hand notes — replace them with the verbatim prompt as soon as the user pastes it.

### Core philosophy
- *"Reading first, receipts second."* The prose comes first; the chart data is shown afterwards as supporting receipts.
- *"Meaningful enough to contemplate. Never absolute enough to obey."* No fatalism, no commands, no predictions presented as certainties.
- **Sidereal only.** True-sky positions. Tropical zodiac is rejected because it no longer reflects the actual sky.

### Loudest-signals rule (referenced as "Part 0")
- Choose the **loudest 1 to 3 sky signals** for any given day and interpret them deeply.
- Do not enumerate every planetary placement. Curation IS the work.

### Voice rules (referenced as "Quality rules" and "Avoid" lists)
- Cormorant-serif register: literate, contemplative, slow.
- Metaphor over instruction.
- Second-person, never imperative.
- **Forbidden vocabulary:** "energy," "vibes," "alignment," "manifestation," "the universe," "abundance." Standard horoscope-column English is the failure mode.

### The 25 parts (approximate mapping to UI)
The chat referenced these by number; replace with verbatim section titles once available.

| Master prompt parts | MoonTurtle UI section |
|---|---|
| Parts 2 + 24 | `primary.headline` + `primary.body` |
| Parts 6 + 7 + 12 (compressed) | `activations[5]` |
| Part 11 (Moon vs Sun synthesis) | `lunarAxis.reading` |
| Parts 17 + 18 (trust side) | `notice[4]` |
| Parts 17 + 18 + 23 (shadow side) | `avoid[4]` |
| Parts 8 + 9 (Moon depth) | reserved for long-form mode |
| Part 16 (love / connection) | reserved for long-form mode |
| Part 19 (ritual) | reserved for long-form mode |
| Part 25 (final integration) | reserved for long-form mode |

### Fallback rule (verbatim, as quoted by user)
> *"If you cannot calculate the full true-sky sidereal chart, ask me for a screenshot before continuing."*

This is non-negotiable. If `domain/astronomy.computeNatal()` cannot produce a confident chart (unknown birth time, geocoder failure), the app must surface the screenshot-request flow rather than fabricate placements.

### Sibling prompt
The user mentioned a third related prompt — *"daily readings"* — that they couldn't find at planning time. Reserve `docs/master-prompt-daily.md` for it.

## Where the voice actually lives in code

- `src/reading/prompt/01-identity.md` — distilled philosophy
- `src/reading/prompt/02-voice.md` — voice rules + forbidden vocabulary
- `src/reading/prompt/03-curation.md` — the curation table above, in prompt form
- `src/reading/prompt/04-schema.md` — JSON shape the screens consume
- `src/reading/prompt/05-exemplars.md` — Tyler's reading verbatim; Ali's added Phase 2

When voice drifts, the fix is here, not in screen code.
