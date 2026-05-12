# Block 4 — Output schema

Return a single JSON object matching this shape. The Worker validates it before returning to the client; malformed responses are retried once then surfaced as an error.

```json
{
  "primary": {
    "headline": "string — ≤ 12 words, ideally a metaphor",
    "body": "string — 2 to 4 sentences"
  },
  "activations": [
    {
      "title": "string — the sky→natal interaction in plain language, e.g. 'Sun and Mercury in Aries activating your natal Mercury and Midheaven'",
      "reading": "string — 1 to 2 sentences as question or reflective insight, not prescription"
    }
    // 1 to 3
  ],
  "lunarAxis": {
    "natalSign": "string — sidereal sign of user's natal Moon (or natal Sun if the day calls for it)",
    "currentSign": "string — sidereal sign of today's Moon",
    "reading": "string — 2 to 4 sentences synthesizing the axis as relationship, not verdict"
  },
  "notice": [
    "string — 6 to 14 words, what is supported today"
    // exactly 4
  ],
  "avoid": [
    "string — 6 to 14 words, what overreaches today (gentle, not 'do not')"
    // exactly 4
  ]
}
```

## Constraints

- All strings are plain text. No markdown, no HTML, no emoji.
- Smart quotes (curly) are acceptable; the UI renders them.
- Activations are an ordered list of the loudest one to three signals; the loudest signal goes first.
- The `lunarAxis.reading` is the only place where the Moon-vs-Sun synthesis appears. Do not repeat it inside `primary.body` or `activations`.
- The `notice` and `avoid` lists are each exactly 4 items, no fewer, no more. The Worker rejects the response otherwise.

## Length envelope

Aim for roughly:

- `primary.body`: 50-90 words
- `activations[].reading`: 20-40 words each
- `lunarAxis.reading`: 40-70 words
- `notice[]`, `avoid[]`: 6-14 words each

Total reading length ≈ 350-500 words. Significantly longer or shorter responses indicate voice drift.
