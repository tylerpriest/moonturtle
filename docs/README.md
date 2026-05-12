# MoonTurtle docs

This folder is the product and implementation source of truth for MoonTurtle.

Use these docs in this order when making product decisions:

1. `product-brief.md` - why MoonTurtle exists, who it serves, and what must stay true.
2. `prd.md` - product requirements for the current soft-launch product.
3. `jtbd-user-stories.md` - user jobs, personas, user stories, and acceptance criteria.
4. `decision-log.md` - locked product and architecture choices that prevent soft-launch drift.
5. `task-backlog.md` - epics, tasks, sequencing, and done checks.
6. `phase-1-build-contract.md` - engineering scope and non-negotiable implementation criteria.
7. `design-rules.md` - UI and interaction rules for the app surface.
8. `astronomy-spec.md`, `signal-ranking.md`, and `data-privacy-storage.md` - deterministic product contracts.
9. `prompt-ops.md`, `master-prompt.md`, and `reading/prompt/*` - voice, model, and prompt-operation rules.
10. `testing-checklist.md` and `failure-states.md` - release and resilience checks.

## What else belongs here

These are useful additions once the product has real practitioner feedback:

- `release-plan.md` - launch gates, beta cohort, release owner, rollback plan, and production checklist.
- `feedback-log.md` - practitioner feedback grouped by theme, not a raw dump.
- `metrics.md` - qualitative and quantitative success signals. Keep this privacy-preserving.
- `research-notes.md` - source links and observations for astronomy, interpretation, and practitioner workflows.
- `copy-bank.md` - reusable onboarding, error, permission, and empty-state copy.
- `support-runbook.md` - known issues, recovery steps, provider outages, and troubleshooting.
- `roadmap.md` - phase-level product direction after the backlog stabilizes.

Keep docs short enough to stay useful. If a document becomes a graveyard, split it into a decision log, backlog, or reference spec.
