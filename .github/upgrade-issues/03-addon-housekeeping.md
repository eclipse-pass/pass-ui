---
title: "Replace/remove deprecated and Vite-incompatible addons"
labels: ["upgrade", "sprint-2"]
depends_on: [2]
---

## Summary

Replace or remove addons that are deprecated, redundant, or incompatible with Vite before the build system migration.

## Blocked By

- #2 — GTS + TypeScript conversion (complete modernization first) ✅

## Addon Audit (Feb 2026)

### Remove (Unused)

**`@coreui/ajax`** (1.0.10) — zero imports anywhere in the codebase. Remove.

**`ember-radio-buttons`** (^5.0.0) — zero imports, zero `<RadioButton` usage. Remove.

**`ember-truth-helpers`** (^3.1.1) — zero imports. All truth helpers were replaced with local plain functions during GTS conversion. Remove.

**`ember-composable-helpers`** (^5.0.0) — zero imports in app code. Only referenced in `ember-cli-build.js` config (`only: ['queue', 'compute', 'invoke', 'includes']`). All usage was replaced with local functions during GTS conversion. Remove addon + build config.

~~**`loader.js`** (^4.7.0)~~ — AMD loader, zero direct imports but **still required by Ember's test harness** under Embroider/Webpack. Removing it causes tests to fail to load. Keep until Vite migration.

### Remove (Redundant) + Update ember-concurrency

**`ember-concurrency-decorators`** (^1.0.0) — 11 import sites across app. Remove package, change all imports to `ember-concurrency`.

**`ember-concurrency`** (2.3.7 → 4.x) — Update to latest v4 (V2 Embroider addon, Vite-ready).
- v4.x: decorators deprecated but still work, needs babel transform config
- v5.x: decorators **removed entirely**, requires converting all tasks to `task(async () => {})` syntax — defer to issue #6
- Current tasks use generator syntax (`@task *myTask() { yield ... }`) which v4.x supports

Files to update (swap import source only):
- `app/services/current-user.ts` — `task`
- `app/services/submission-handler.ts` — `task`
- `app/controllers/submissions/new/basics.ts` — `task`
- `app/components/notice-banner/index.gts` — `task`
- `app/components/workflow-metadata/index.gts` — `task`
- `app/components/workflow-basics-user-search/index.gts` — `task`
- `app/components/nav-bar/index.gts` — `task`
- `app/components/workflow-basics/index.gts` — `dropTask`
- `app/components/workflow-review/index.gts` — `task`
- `app/components/found-manuscripts/index.gts` — `task`
- `app/components/find-journal/index.gts` — `dropTask`

### Replace (Vite-incompatible)

**`ember-cli-mirage` (^3.0.3) → `ember-mirage`**
- 14 import sites (13 test files + `mirage/config.js`)
- Mirage factories, fixtures, and config should carry over
- Import paths change: `ember-cli-mirage/test-support` → `ember-mirage/test-support`

### Replace with Native

**`ember-lodash` (^4.19.5) → `lodash-es`**
- 3 files import `lodash` as `_` (ember-lodash re-exports it):
  - `app/controllers/submissions/new.ts` — `_.uniqBy()`
  - `app/controllers/submissions/detail.ts` — `_.uniqBy()`
  - `app/services/submission-handler.ts` — `_.uniqBy()`, `_.compact()`
- Replace with direct ESM imports: `import { uniqBy, compact } from 'lodash-es'`
- Only 2 functions used — could also trivially replace with native JS:
  - `uniqBy(arr, key)` → `[...new Map(arr.map(x => [x[key], x])).values()]`
  - `compact(arr)` → `arr.filter(Boolean)`

**`@ember/string` (^3.1.1) → native or inline**
- 3 files use `camelize` and/or `dasherize`:
  - `app/adapters/application.js` — `camelize`
  - `app/serializers/application.js` — `camelize`, `dasherize`
  - `mirage/config.js` — `camelize`
- Can write 2 small utility functions or use a lightweight lib
- Note: adapter + serializer are still `.js` — will need to exist until Vite migration

### Keep (Actively Used, Vite-compatible or deferred)

**`ember-modal-dialog`** (^4.1.4) — 2 import sites (`message-dialog`, `workflow-basics`). Evaluate replacing with `<BsModal>` from ember-bootstrap (already installed). If not feasible now, defer.

**`ember-tether`** (^3.1.0) — zero direct imports but is a dependency of `ember-modal-dialog`. Removal blocked on modal-dialog evaluation.

**`ember-cli-flash`** (^4.0.0) — 3 import sites. Actively used for flash messages.

**`ember-power-select`** (^7.2.0) — 1 import site (`find-journal`). Actively used.

**`ember-models-table`** (^5.4.1) — 5 import sites. Actively used for data tables. v5 is Vite-compatible.

**`tracked-built-ins`** (^3.3.0) — zero direct imports, but used internally by `ember-file-upload` and `ember-models-table`. Keep until 6.8 where `@ember/reactive/collections` replaces it (issue #6).

**`ember-cli-typescript`** (^5.3.0) — build infrastructure, still needed.

**`ember-cli-htmlbars`** (^6.3.0) — build infrastructure, still needed.

**`ember-test-selectors`** (^6.0.0) — configured in build (`strip: false`), 464+ `data-test-*` attributes. Keep.

## Execution Order

1. Remove unused addons (zero-risk): `@coreui/ajax`, `ember-radio-buttons`, `ember-truth-helpers`, `ember-composable-helpers`, `loader.js`
2. Swap `ember-concurrency-decorators` imports → `ember-concurrency` (11 files, remove package)
3. Replace `ember-lodash` → `lodash-es` or native (3 files)
4. Replace `@ember/string` → inline utilities (3 files)
5. Replace `ember-cli-mirage` → `ember-mirage` (14 test files + config)
6. Evaluate `ember-modal-dialog` → `<BsModal>` (2 files)

## Acceptance Criteria

- [ ] Unused addons removed from package.json
- [ ] `ember-concurrency-decorators` removed, imports point to `ember-concurrency`
- [ ] `ember-lodash` replaced
- [ ] `@ember/string` replaced
- [ ] `ember-cli-mirage` replaced with `ember-mirage`
- [ ] `pnpm lint` clean
- [ ] `pnpm test:ember` 225/225 pass
