---
title: "Final end-to-end verification (6.8 LTS milestone)"
labels: ["upgrade", "sprint-2"]
depends_on: [6]
status: complete
---

## Summary

Final verification that the 6.8 LTS milestone is complete. This was the original "done" state for issues 01-06.

**Status**: COMPLETE. All checks passed on 6.8.3 LTS with full TypeScript + GTS + Vite.

## Post-6.8 Work

Issues 08-13 cover the path from 6.8 to 7.0:
- #8 — Fix typecheck errors (193 remaining)
- #9 — Legacy pattern cleanup (@alias, @computed, get/set, @observes)
- #10 — Remove/replace v1 addons (ember-bootstrap, ember-models-table, etc.)
- #11 — Ember Data → WarpDrive migration (store.request() + schemas)
- #12 — Clear deprecations + upgrade to 6.12
- #13 — Upgrade to Ember 7.0

## Checks (6.8 milestone)

- [x] `pnpm test:ember` — 224/224 tests pass
- [x] `pnpm lint` — no errors
- [x] `pnpm build` — production build succeeds
- [x] Vite build system working
- [x] Full TypeScript + GTS conversion complete
- [x] Ember Data 6.0 deprecations resolved
- [x] `ember-route-template` removed, native GTS route templates working
