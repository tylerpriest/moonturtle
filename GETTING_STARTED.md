# Getting started

This repo is a static MoonTurtle prototype plus a strong implementation plan. Start here when you are the next fresh agent.

## Do first

1. Run `npm install`.
2. Run `npm run build`.
3. Read `docs/phase-1-build-contract.md`, `docs/astronomy-spec.md`, `docs/signal-ranking.md`, `docs/data-privacy-storage.md`, `docs/failure-states.md`, `docs/prompt-ops.md`, and `docs/testing-checklist.md`.
4. Read `docs/plan.md`, `docs/design-rules.md`, `docs/master-prompt.md`, `docs/seed-users.md`, and `docs/open-source-astrology-tools.md`.
5. Treat Phase 0 as complete. Do not move the app back to the old flat layout.
6. Begin Phase 1 with `src/domain/astronomy.js`, `src/domain/schema.js`, and focused regression tests for Tyler and Ali.

## Current layout

The live prototype code is now in the intended module layout:

```text
src/
  app/       React shell
  ui/        screens, primitives, theme
  domain/    astronomy/schema placeholders
  reading/   prompt blocks and future reading orchestration
  providers/ future AI adapters
  io/        future storage/geocoding/timezone adapters
  seed/      Tyler and Ali fixtures
  config/    future model/provider config
```

## Product rules to keep in mind

- Reading first, receipts second.
- Follow `docs/phase-1-build-contract.md` for scope.
- Follow `docs/design-rules.md` before changing `src/ui/*`.
- Follow `docs/astronomy-spec.md` before changing `src/domain/*`.
- Follow `docs/data-privacy-storage.md` before changing storage/API payloads.
- True-sky sidereal via open IAU constellation boundaries, not tropical, not equal-sign Lahiri, not copied MTZ data.
- Birth data stays local in v1; the Worker receives computed chart data only.
- Always look for better options the user has not named, especially around tooling and architecture, but keep simple requests practical.

## Next implementation slice

Build the astronomy path first:

1. Add `src/domain/schema.js`.
2. Add `src/domain/astronomy.js`.
3. Add a boundary generator for `src/domain/zodiac-boundaries.json`.
4. Use `astronomy-engine` for positions/current sky and MoonTurtle's own IAU sign lookup.
5. Evaluate `celestine` for Placidus houses/aspects only after seed-user verification.

Do not wire AI generation until the deterministic astronomy layer is passing.
