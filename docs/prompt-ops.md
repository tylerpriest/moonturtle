# Prompt operations

MoonTurtle's prompt is product code. Treat changes to `src/reading/prompt/*` like code changes.

## Prompt files

Current blocks:

- `01-identity.md` - framework, philosophy, fallback behavior
- `02-voice.md` - voice rules and forbidden vocabulary
- `03-curation.md` - mapping from master prompt to UI fields
- `04-schema.md` - JSON output shape
- `05-exemplars.md` - voice exemplars

Future likely block:

- `06-daily-task.md` - compact daily-task framing from `docs/master-prompt-daily.md`

## Source of truth

- `docs/master-prompt.md` is the long-form source of voice truth.
- `docs/master-prompt-daily.md` is a draft daily-cadence prompt, not final.
- `src/reading/prompt/*` is what the app actually sends.

If these disagree, update the app prompt deliberately and record why.

## Editing rules

- Keep prompt changes batched. Tiny frequent edits reduce cache hits.
- Do not tune voice from one chart only.
- Use Tyler and Ali as minimum regression fixtures.
- Never let exemplar-specific names, cities, or life details become reusable instructions.
- Keep schema and UI in sync. If prompt schema changes, update validators and screens in the same change.

## Exemplar rules

An exemplar is a voice reference, not a data source.

Every exemplar block must include:

- chart context
- generated reading
- "why this passes"
- explicit no-bleed instruction

Bleed test:

- generate for a third unrelated test chart
- output must not mention Tyler, Ali, Tauranga, Melbourne, Manly, Sydney, or exemplar-specific details unless they belong to the test chart

## Schema validation

Generated reading must match:

```js
{
  primary: { headline, body },
  activations: [{ title, reading }], // exactly 5
  lunarAxis: { natalSign, currentSign, reading },
  notice: [], // exactly 4
  avoid: [] // exactly 4
}
```

Worker should:

1. request structured JSON
2. validate exact counts
3. validate string lengths enough to prevent runaway prose
4. retry once on malformed output
5. return structured error if still invalid

## Forbidden words

Use `src/reading/prompt/02-voice.md` as the canonical list.

At minimum, generated output must not include:

- energy, when used as vague spiritual filler
- vibes / vibe
- alignment, when used as cosmic cliche
- manifestation / manifest
- the universe, as an agent
- abundance, as new-age filler
- high vibration / low vibration

Because "energy" can be legitimate in body/sleep contexts, validation may need word-boundary plus phrase-context checks. Err on the side of retrying early.

## Cache behavior

Prompt blocks should have a stable `promptVersion`.

Cache key should include:

- birthHash
- date
- promptVersion
- chartHash
- signalsHash

If promptVersion changes, do not reuse old prose as if it were fresh. Old readings can stay in Journal as historical entries.

## Model/provider switching

Provider adapters must share one interface:

```js
generate({ system, messages, schema, metadata })
```

Switching model should not affect:

- astronomy
- signal ranking
- cache key except provider metadata/prompt version
- UI shape

## Voice regression

For every prompt change:

1. Generate Tyler daily reading.
2. Generate Ali daily reading.
3. Generate one unrelated test reading.
4. Check schema exactness.
5. Check forbidden words.
6. Check no exemplar bleed.
7. Check curation: does it focus on loudest 1-3 signals?
8. Compare against `docs/exemplars/ali-daily-2026-05-09.md` for tone, not facts.

## What not to do

- Do not paste the full 25-part master prompt into every request.
- Do not ask the model to calculate astronomy.
- Do not ask the model to discover every transit from raw data.
- Do not add rituals, tarot, synastry, or multi-system readings to the daily schema in Phase 1.
- Do not use model prose as factual receipts.
