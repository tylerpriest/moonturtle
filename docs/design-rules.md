# MoonTurtle design rules

This is the canonical design guide for MoonTurtle UI work. Read it before editing `src/ui/*`.

## North star

MoonTurtle is a reading-first sidereal astrology app for contemplative practitioners.

The product sentence is:

> Meaningful enough to contemplate. Never absolute enough to obey.

Design should make that sentence feel true. The app is quiet, precise, warm, and grounded. It should feel like a ritual notebook with reliable receipts, not a horoscope feed, productivity dashboard, or mystical slot machine.

## Product hierarchy

1. **Today is the product.** The daily reading is the primary surface.
2. **Sky and Natal are receipts.** They prove the reading, but they do not lead the experience.
3. **Method builds trust.** Use it for transparency, agency, and framework explanations.
4. **Journal shows continuity.** No streaks, scores, badges, leaderboards, or performance loops.
5. **Onboarding earns trust.** Birth data stays local in v1. Be explicit and calm about that.

## Visual direction

Use the existing MoonTurtle language:

- warm parchment backgrounds
- terracotta, ochre, moss, plum, and muted ink accents
- Cormorant Garamond for the reading voice
- Cormorant SC for small labels
- Inter only for metadata, timestamps, and receipt-like facts
- fine hairlines, modest spacing, and low visual noise
- simple moon, sky, botanical, and brand primitives from `src/ui/components/Primitives.jsx`

The current tokens live in `src/ui/theme/styles.css`. Prefer those variables over new colors or typography.

## Layout rules

- Design mobile-first at 390-430px.
- Desktop stays a centered mobile column, not a separate desktop dashboard.
- Keep one main scroll surface inside `.app-shell`.
- Keep bottom navigation stable and predictable.
- Use full-width sections and individual cards. Do not put cards inside cards.
- Use cards for repeated readings, receipt blocks, small framed facts, and modal-like moments.
- Keep cards square or nearly square-cornered. The current card radius is intentionally minimal.
- Avoid landing-page composition, hero sections, marketing copy, decorative gradients, or large empty showcase areas.

## Screen roles

### Today

Lead with the primary synthesis. The reading should feel authored, personal, and quiet enough to sit with.

Required order:

1. date and greeting
2. primary reading card
3. Moon axis
4. activations
5. notice / avoid
6. receipts CTA
7. product sentence

### Sky

This is the receipts screen. It should be factual, compact, and transparent. It should show the current Moon, Sun, lunar phase, illumination, rise/set, and calculation method without becoming a technical manual.

### Natal

This is the baseline pattern. It should synthesize before listing placements. Do not make it a raw chart dump.

### Journal

This is continuity without gamification. Show history, phase rhythm, and recurring themes. Never add streaks, scores, checkmarks, levels, or pressure.

### Method

This is trust and transparency. Keep it grounded: astronomy and interpretation are separate, agency comes first, and the app is not fatalistic.

### Onboarding

Use native inputs where possible. Ask for only what the app needs. Never imply a location has been detected before permission is granted.

## Copy rules

The UI copy should match the reading voice:

- contemplative, specific, and image-anchored
- second-person when useful, but not bossy
- reflective rather than predictive
- short enough to scan, rich enough to contemplate
- plain about uncertainty and method

Avoid:

- generic horoscope language
- hype, urgency, or certainty theater
- "the universe is telling you" phrasing
- gamified product language
- long disclaimers that make the interface feel defensive

Use the prompt voice rules in `src/reading/prompt/02-voice.md` when writing generated-reading surfaces.

## Interaction rules

- Buttons should be clear commands, not decorative labels.
- Use native mobile controls for date, time, location, and simple settings until a custom control clearly pays for itself.
- Make receipt links and CTAs obvious but calm.
- Use loading states that name what is happening: calculating sky, writing reading, checking cache.
- AI failure should not break the app. Show real astronomy and explain what failed.
- Geocoding failure should offer manual entry.

## What not to add

- no purple-dominant palette
- no orbs, bokeh blobs, or decorative cosmic gradients
- no charts-as-hero
- no generic astrology stock imagery
- no streaks, scores, badges, or progress pressure
- no account/paywall/cloud-sync UI in v1
- no CSS framework unless the codebase has genuinely outgrown the current system
- no desktop-only layout fork

## Better-option check

Before implementing a visible UI change, explicitly ask:

- Is there a better simpler option the user did not name?
- Can existing primitives solve this?
- Does this help the reading, receipts, trust, or continuity?
- Does this add pressure, noise, or false certainty?
- Would a practitioner trust this more after seeing it?

If the better option is real, mention it briefly and choose the practical path.

## Verification

Before finishing substantial UI work:

1. Run `npm run build`.
2. Check the page at mobile width around 390-430px.
3. Confirm text does not overlap or spill out of buttons/cards.
4. Confirm Today still leads with the reading and Sky/Natal remain supporting receipts.
5. Grep for new hardcoded colors. Prefer `src/ui/theme/styles.css` tokens.
6. Grep for gamification words if touching Journal or onboarding: streak, score, badge, level, unlock.

## Source references

- `docs/plan.md` - product principles and architecture.
- `src/ui/theme/styles.css` - visual tokens and shared components.
- `docs/design-source/chat-transcript.md` - original visual direction and screen intent.
- `src/reading/prompt/02-voice.md` - generated-reading voice rules.
