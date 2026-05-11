# MoonTurtle

A sidereal astrology app. Reading-first, receipts-second. *Meaningful enough to contemplate. Never absolute enough to obey.*

## For the next agent — start here

1. **Read [`docs/plan.md`](docs/plan.md) end-to-end.** It contains design principles, module boundaries, phases, file-by-file change list, verification steps, and known risks. Don't start coding without it.
2. **Read [`docs/master-prompt.md`](docs/master-prompt.md).** This is the source of voice truth. The user will paste the verbatim master prompt here before Phase 1.
3. **Read [`docs/seed-users.md`](docs/seed-users.md).** Tyler and Ali are the two astronomical regression fixtures and voice exemplars. Every change must pass for both.
4. **Skim [`docs/design-source/`](docs/design-source/).** The original Claude Design HTML/JSX handoff and the chat transcript. Visual reference.

## Current state

This repo contains a **static visual prototype** of the soft-launch product:

- Vite + React app, 5 screens + onboarding, working build at `dist/`
- Every value is hardcoded to one demo user (Tyler) in `src/data.js`
- No astronomy library wired in, no AI generation, no localStorage persistence

It's a gorgeous design demo, not a product yet. The plan describes how to turn it into one.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000 — static prototype
npm run build     # production bundle
```

## Personal-use mode (BYO subscription)

The plan supports running with your own ChatGPT Plus or Claude.ai subscription instead of API credits, via [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI). See `docs/plan.md` § "Reading engine" and § Phase 1 step 10.

```bash
# One-time setup
brew install cliproxyapi && npm i -g @openai/codex && codex login
# (Claude Code's own login covers the Anthropic side automatically.)

# Daily use
npm run dev:byo   # scripts/dev-byo.sh — starts CLIProxyAPI then Vite
```

Set `MT_MODEL=gpt-5.5` or `MT_MODEL=claude-sonnet-4-6` in `.env.local` to switch providers.

## Layout

The plan dictates a feature-grouped layout — code is organised by *what changes together*, not by file type. After Phase 0 restructure:

```
src/
  app/       ← React shell
  ui/        ← screens + components + theme
  domain/    ← astronomy + schema (pure)
  reading/   ← prompts + generate + cache + useReading hook (the product)
  providers/ ← AI adapters (Anthropic / OpenAI / CLIProxyAPI)
  io/        ← storage + geocoding + timezone adapters
  seed/      ← Tyler + Ali fixtures
  config/    ← MT_MODEL → provider resolution
functions/api/ ← Cloudflare Worker
docs/        ← THIS DIRECTORY
```

See `docs/plan.md` § "Module boundaries" for contracts and the swap/composition/voice tests.
