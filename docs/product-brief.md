# MoonTurtle project brief

## One-line description

MoonTurtle is a reading-first true-sky sidereal astrology app for contemplative practitioners who want daily interpretation grounded in transparent astronomy.

## Product promise

Meaningful enough to contemplate. Never absolute enough to obey.

MoonTurtle should feel like a quiet ritual notebook with reliable receipts: the reading leads, the sky explains, the natal chart anchors, and the method builds trust.

## Problem

Many astrology apps make three mistakes at once:

- They lead with generic horoscope copy instead of a specific, authored reading.
- They hide or blur the astronomical method, which makes trust hard for serious practitioners.
- They make the experience feel gamified, fatalistic, or noisy.

MoonTurtle exists for people who want symbolism with agency, not instruction disguised as destiny.

## Audience

Primary audience:

- Practitioners, writers, coaches, ritual workers, and astrology-literate users who want a daily contemplative prompt based on their real chart and current sky.

Secondary audience:

- Curious users who may not know sidereal or true-sky frameworks yet, but care about calm design, transparent method, and privacy.

Not the target audience:

- Users looking for predictions, dating compatibility, streaks, pushy reminders, entertainment horoscopes, social sharing, or a full professional astrology workstation.

## Core insight

The reading is the product. Receipts only matter because they make the reading trustworthy.

The app should not ask the user to study every placement. It should choose the loudest one to three signals, write from them beautifully, and leave enough method visible that a practitioner can trust the output.

## Current product shape

MoonTurtle is a Vite and React PWA-oriented app with:

- onboarding for birth details and location context
- deterministic true-sky sidereal astronomy modules
- signal ranking from natal chart plus current sky
- AI or local fallback daily reading generation
- Today, Sky, Natal, Journal, and Method screens
- local-first storage and privacy posture
- Cloudflare Worker API path for generated readings

The existing engineering docs still include some phase-history language. When in doubt, verify the current code and treat `phase-1-build-contract.md` as the scope contract.

## Goals

- Let a real user enter birth data and receive a daily reading grounded in actual sky calculations.
- Make the Today screen feel personal, precise, calm, and worth returning to.
- Show enough receipts to earn practitioner trust without turning the app into a technical chart dump.
- Keep raw birth data local in v1.
- Provide useful fallback behavior when AI, geocoding, permissions, or storage fail.
- Preserve the MoonTurtle voice across model and prompt changes.

## Non-goals

- Accounts, auth, cloud sync, payments, teams, or analytics.
- Tropical astrology or silent fallback to tropical labels.
- Full long-form 25-part reading UI.
- Synastry, progressions, lunar returns, compatibility, or professional chart-workstation features.
- Push notifications, streaks, scores, badges, or gamified retention loops.
- Social feed, sharing-first behavior, or public profiles.
- The named 13-Moon Calendar layer for soft launch.

## Differentiators

- True-sky sidereal via open IAU constellation boundaries, including Ophiuchus.
- Reading-first UX with receipts-second transparency.
- Strict nonfatalistic voice: contemplative, image-rich, never bossy.
- Privacy-preserving architecture: birth data stays local; the API sees computed chart data only.
- Local fallback reading mode when AI is unavailable or intentionally disabled.

## Success signals

Qualitative:

- Practitioners say the reading feels specific without becoming deterministic.
- Users understand why the reading says what it says.
- The Method screen increases trust instead of creating confusion.
- AI fallback and failure states feel honest, not broken.

Quantitative, if measured later:

- Onboarding completion rate.
- Daily reading generation success rate.
- Cache hit rate for same-day readings.
- AI schema validation retry rate.
- Repeat opens over seven days.
- Percentage of users who open receipts after reading.

Do not add invasive analytics to chase these signals in v1. If metrics are added, keep them minimal, anonymous, and documented in a privacy note.

## Open questions

- Should hosted soft launch support user-provided API keys, app-provided credits, or local-only mode first?
- How much chart detail do practitioners want in Sky and Natal before it distracts from Today?
- Which prompt changes improve voice without increasing fatalism or generic spirituality?
- What minimum release instrumentation is acceptable without compromising the privacy posture?
- Is a chart wheel necessary for practitioner trust before wider launch, or can it remain Phase 2?
