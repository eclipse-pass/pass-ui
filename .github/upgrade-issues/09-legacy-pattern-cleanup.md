---
title: "Remove legacy patterns (@alias, @computed, get/set, @observes)"
labels: ["upgrade", "modernize", "sprint-3"]
depends_on: [8]
status: complete
---

## Summary

Remove all classic Ember reactivity patterns from app code. These patterns depend on `@ember/object/computed`, `@ember/object` get/set, and `@ember-decorators/object` — all of which are deprecated and targeted for removal.

**Status**: COMPLETE. All legacy patterns removed. 224/224 tests pass, lint clean, typecheck clean.

## What Was Done

### @alias → native getters (25 in 7 controllers)

All 25 aliases converted across all 7 submission workflow controllers. basics.ts required a coordinated conversion (see below).

### @computed → native getters (14 in 5 files)

All 14 converted. Key lesson: `journal?.get?.('isMethodA')` must use `.get()` because `publication.journal` is `async: true` (ObjectProxy/PromiseBelongsTo).

### get()/set() → direct property access

All imported `get()`/`set()` from `@ember/object` removed from app code. Remaining `.get()` method calls are on async relationship proxies (`publication.journal`, `grant.primaryFunder`) — these must stay until WarpDrive migration (Issue #11) eliminates ObjectProxy.

Files converted: application.ts, dashboard.ts, routes/dashboard.ts, routes/policies.ts, search-helper.ts, doi.ts, workflow.ts, new.ts, repositories.ts, submission-handler.ts, detail.ts, basics.ts, files.ts, review.ts, routes/detail.ts, routes/new.ts.

### basics.ts coordinated conversion

The most complex file — 4 `@alias` + 4 `@computed` + remaining `get()`/`set()` all tightly coupled through `Controller.model` (not `@tracked`).

**Solution**: `@tracked _publicationVersion` dirty flag in the `publication` getter forces re-evaluation when `updatePublication` replaces the publication on the model hash. Validation getters (`titleIsInvalid`, `journalIsInvalid`) read `this.model.publication` directly to avoid the autotracking cache.

Test update: changed `journal: []` to `journal: EmberObject.create({})` in 2 unit tests (arrays don't have `.get()` method; controller uses `journal?.get?.('id')`).

### @observes removal

`app/helpers/search-associated.js` — **Deleted**. Dead code (not imported or invoked anywhere in app or tests).

### Transform.extend() → native class

`app/transforms/set.js` → `app/transforms/set.ts` — Converted from `Transform.extend()` to `class SetTransform extends Transform` with TypeScript types.

## Acceptance Criteria

- [x] Zero `@alias` imports from `@ember/object/computed`
- [x] Zero `@computed` imports from `@ember/object`
- [x] Zero `get()`/`set()` imports from `@ember/object` in app code
- [x] Zero `@observes` / `@ember-decorators/object` usage
- [x] Zero `Transform.extend()` (classic class syntax)
- [x] `pnpm typecheck` — 0 errors
- [x] `pnpm test:ember` — 224/224 pass
- [x] `pnpm lint` — no errors
