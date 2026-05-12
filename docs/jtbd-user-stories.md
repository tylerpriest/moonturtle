# JTBD and user stories

## Personas

### Contemplative practitioner

Uses astrology, journaling, coaching, ritual, or somatic practice. Wants a daily symbolic prompt that respects agency and does not flatten the chart into generic advice.

### Astrology-literate skeptic

Interested in method and precision. Will trust the app only if the astronomy, sidereal convention, and interpretation boundary are transparent.

### Reflective beginner

Does not need a full chart education. Wants a beautiful, calm reading and enough explanation to avoid feeling manipulated.

### Product tester

Checks whether the reading pipeline works across charts, dates, providers, and failure states.

## Jobs to be done

### JTBD 1: Receive a grounded daily reading

When I open the app in the morning, I want a reading based on my chart and today's actual sky so I can contemplate the day without being told what to do.

Success looks like:

- reading feels specific and calm
- key signals are distilled, not exhaustively listed
- the user can sit with the reading rather than decode the app

### JTBD 2: Trust the method

When a reading resonates or challenges me, I want to see the astronomical receipts so I can understand what it is based on.

Success looks like:

- current sky and natal placements are visible
- method explains true-sky sidereal clearly
- interpretation is not presented as objective fact

### JTBD 3: Keep birth data private

When I enter sensitive birth details, I want to know what is stored and sent so I can decide whether I trust the product.

Success looks like:

- privacy copy is plain
- raw birth data stays local
- API payloads use computed chart data only

### JTBD 4: Continue a reflective practice

When I return over time, I want to see the thread of prior readings without being pushed into streaks or performance.

Success looks like:

- journal entries are useful and quiet
- no gamified pressure
- fallback readings are labeled honestly

### JTBD 5: Recover from imperfect inputs and outages

When location, AI, or storage fails, I want the app to remain useful and honest instead of pretending nothing happened.

Success looks like:

- manual input alternatives exist
- real astronomy still appears where possible
- no fabricated angles, houses, or readings

## User stories

### Onboarding

As a new user, I want to enter my birth date, time, and place so MoonTurtle can calculate my chart.

Acceptance:

- native date and time inputs work on mobile
- birth time can be marked unknown
- birth place resolves to coordinates and timezone
- validation errors explain the next action

As a privacy-conscious user, I want to understand what data stays local before I grant permissions.

Acceptance:

- permission copy is clear and calm
- user can continue without device location
- raw birth data is not sent to the reading API

As a user with a failed place search, I want to enter location manually so I can finish setup.

Acceptance:

- manual coordinates or fallback fields are available where implemented
- timezone ambiguity is surfaced
- app does not block forever on geocoding

### Daily reading

As a returning user, I want to open Today and immediately see my current reading.

Acceptance:

- cached same-day reading loads when available
- new reading generation shows meaningful progress
- loading does not shift or overlap core UI

As a reflective user, I want the reading to offer images and tensions, not commands.

Acceptance:

- primary reading avoids fatalistic language
- activations are tied to ranked signals
- notice and avoid items are specific and non-prescriptive

As a user in local-only mode, I want a fallback reading so the app still has value without AI.

Acceptance:

- fallback state is labeled
- astronomy receipts still display
- fallback does not pretend to be generated prose

### Receipts

As an astrology-literate user, I want to inspect the current sky behind the reading.

Acceptance:

- Moon sign, phase, illumination, rise, and set are visible
- current planetary placements use true-sky signs
- method is named without overwhelming the screen

As a user checking my baseline pattern, I want to see my natal chart in the same framework as the reading.

Acceptance:

- natal placements use true-sky sidereal labels
- unknown birth time hides angles and houses
- chart ruler appears only when computable

### Journal

As a returning user, I want a local record of prior readings so I can notice continuity.

Acceptance:

- entries include date, phase, headline, source, and fallback status
- journal does not create pressure loops
- local data reset is recoverable through onboarding

### Settings and method

As a technically curious user, I want to know how the app separates astronomy and interpretation.

Acceptance:

- Method screen explains calculation convention, interpretation limits, privacy, and agency
- copy avoids defensive or mystical overclaiming

As a provider tester, I want to switch model behavior where supported.

Acceptance:

- settings persist locally
- invalid provider key leads to a useful error or fallback
- cache keys distinguish AI mode and provider state

## Story priority

P0:

- onboarding can complete
- Today shows reading or honest fallback
- astronomy receipts are correct enough for seed regression
- birth data privacy contract holds
- AI unavailable does not blank the app

P1:

- journal continuity is polished
- model/settings UI is clear
- manual failure recovery is smooth
- Method explains the convention elegantly

P2:

- chart wheel
- richer practitioner receipts
- release metrics
- feedback capture
- wider hosted beta workflow
