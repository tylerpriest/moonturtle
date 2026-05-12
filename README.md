# MoonTurtle

A sidereal astrology app. Reading-first, receipts-second. *Meaningful enough to contemplate. Never absolute enough to obey.*

## For the next agent — start here

1. **Read [`GETTING_STARTED.md`](GETTING_STARTED.md).** It gives the literal next steps for a fresh agent.
2. **Read [`docs/README.md`](docs/README.md), [`docs/product-brief.md`](docs/product-brief.md), [`docs/prd.md`](docs/prd.md), [`docs/jtbd-user-stories.md`](docs/jtbd-user-stories.md), and [`docs/task-backlog.md`](docs/task-backlog.md).** These explain the product, users, requirements, and work queue.
3. **Read [`docs/phase-1-build-contract.md`](docs/phase-1-build-contract.md).** This is the implementation scope and done criteria.
4. **Read [`docs/plan.md`](docs/plan.md) end-to-end.** It contains design principles, module boundaries, phases, file-by-file change list, verification steps, and known risks. Don't start coding without it.
5. **Read [`docs/astronomy-spec.md`](docs/astronomy-spec.md), [`docs/signal-ranking.md`](docs/signal-ranking.md), and [`docs/data-privacy-storage.md`](docs/data-privacy-storage.md).** These are the deterministic product contracts.
6. **Read [`docs/failure-states.md`](docs/failure-states.md), [`docs/prompt-ops.md`](docs/prompt-ops.md), and [`docs/testing-checklist.md`](docs/testing-checklist.md).**
7. **Read [`docs/master-prompt.md`](docs/master-prompt.md).** This is the source of voice truth.
8. **Read [`docs/seed-users.md`](docs/seed-users.md).** Tyler and Ali are the two astronomical regression fixtures and voice exemplars. Every change must pass for both.
9. **Read [`docs/design-rules.md`](docs/design-rules.md).** This is the canonical UI/design guide.
10. **Skim [`docs/open-source-astrology-tools.md`](docs/open-source-astrology-tools.md).** Tooling options and why the current recommendation exists.
11. **Skim [`docs/design-source/`](docs/design-source/).** The original Claude Design HTML/JSX handoff and the chat transcript. Visual reference.

## Current state

This repo contains a **static visual prototype** of the soft-launch product:

- Vite + React app, 5 screens + onboarding
- Every value is hardcoded to one demo user (Tyler) in `src/seed/tyler.js`
- No astronomy library wired in, no AI generation, no localStorage persistence

It's a gorgeous design demo, not a product yet. Phase 0 is complete; Phase 1 turns it into a real app.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000 — static prototype
npm run build     # production bundle
```

## Personal-use mode

On localhost, MoonTurtle can use the CLI subscriptions already logged in on this Mac. The default is Codex first, then Claude as fallback. The app also has a Settings → AI Settings panel for choosing Auto, Codex, Claude, API key, or Local-only.

```bash
npm run dev
# open http://localhost:3000
```

For production or explicit API-key mode, Settings can store an Anthropic API key locally on the device. Hosted deployments can also use `ANTHROPIC_API_KEY` on the Worker.

## Layout

The plan dictates a feature-grouped layout — code is organised by *what changes together*, not by file type. After Phase 0 restructure:

```
src/
  app/       ← React shell
  ui/        ← screens + components + theme
  domain/    ← astronomy + schema (pure)
  reading/   ← prompts + generate + cache + useReading hook (the product)
  providers/ ← AI adapter status and future provider modules
  io/        ← storage + geocoding + timezone adapters
  seed/      ← Tyler + Ali fixtures
  config/    ← MT_MODEL → provider resolution
functions/api/ ← Cloudflare Worker
docs/        ← THIS DIRECTORY
```

See `docs/plan.md` § "Module boundaries" for contracts and the swap/composition/voice tests.
