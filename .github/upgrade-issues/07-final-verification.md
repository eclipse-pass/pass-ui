---
title: "Final end-to-end verification"
labels: ["upgrade", "sprint-2"]
depends_on: [6]
---

## Summary

Final verification that the fully upgraded and modernized app works correctly.

## Blocked By

- #6 — Upgrade to 6.8

## Checks

- [ ] `pnpm test:ember` — full test suite passes
- [ ] `pnpm lint` — no errors
- [ ] `pnpm build` — production build succeeds
- [ ] `pnpm start` — Vite dev server starts, app loads, HMR works
- [ ] `pnpm build:docker` — Docker image builds and runs
- [ ] Manual smoke test: full submission workflow (basics → grants → policies → repositories → metadata → files → review)

## Post-Upgrade State

- Ember 6.8 LTS
- Full TypeScript (`.ts` for non-component files)
- Full GTS (`.gts` for components with template-tag format)
- Vite build system
- Zero legacy patterns (no get/set, @computed, @alias, @observes, {{action}})
- Deprecation workflow in place for future upgrades
