# Symbolic Lexicon

MoonTurtle separates calculated astronomy from symbolic interpretation.

The astronomy layer answers: where is the Moon, Sun, planet, angle, or node in MoonTurtle's true-sky sidereal framework?

The symbolic lexicon answers: what interpretive language does the app use for that calculated placement?

## Current Local Source

The local, non-AI reading engine uses:

- `src/reading/lexicon/symbolic-lexicon.json` as the authored interpretation source.
- `src/reading/lexicon/index.js` as the helper API used by `src/reading/generate.js`.

This lexicon is not copied from one book, author, or school. It is a MoonTurtle-authored synthesis. Each entry names the symbolic systems it draws from.

## Systems Named In The Lexicon

- **True-sky sidereal astronomy:** placement framework only. Physical bodies are labelled by observer-sky IAU constellation containment; ecliptic points use the documented boundary fallback. This decides where a body or point is, not what it means.
- **Modern Western astrology:** psychological sign, planet, house, and aspect meanings.
- **Traditional Western astrology:** elements, modalities, rulerships, angularity, and inherited house topics.
- **Lunar cycle practice:** waxing, full, waning, and dark Moon timing language.
- **Solar cycle practice:** Sun-sign chapters, vitality, visibility, seasonal emphasis, and the longer arc of what is being lit.
- **Somatic reflective practice:** non-medical body metaphors and nervous-system reflection prompts.
- **MoonTurtle editorial synthesis:** agency-first wording, curation, and product voice.

## Important Boundary

When MoonTurtle says Aries can mean "heat, beginning, courage," that is not an astronomical fact. It is symbolic interpretation. The astronomy is calculated; the meaning is authored.

Ophiuchus is handled especially carefully: it belongs to the true-sky constellation framework, but it is not part of the standard twelve-sign rulership system. Its meanings are MoonTurtle editorial symbolism and should stay clearly labelled that way.

## Adding New Systems

Only add a new interpretive system when the app can name it honestly and use it respectfully.

Do not extract from closed, Indigenous, initiatory, or living cultural traditions without partnership, permission, or licensing. If a future feature adds tarot, numerology, dreamwork, Human Design, Hellenistic profections, or another layer, add it as a separately named system and make the UI clear that it is an additional interpretive lens.
