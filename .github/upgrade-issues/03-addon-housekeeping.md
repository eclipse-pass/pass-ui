---
title: "Replace/remove deprecated and Vite-incompatible addons"
labels: ["upgrade", "sprint-2"]
depends_on: [2]
---

## Summary

Replace or remove addons that are deprecated, redundant, or incompatible with Vite before the build system migration.

## Blocked By

- #2 — GTS + TypeScript conversion (complete modernization first)

## Addon Changes

### Must Replace (Vite-incompatible)

**`ember-composable-helpers` → `@nullvoxpopuli/ember-composable-helpers`**
- Only 4 helpers used: `queue`, `compute`, `invoke`, `includes`
- Drop-in replacement

**`ember-cli-mirage` → `ember-mirage`**
- Vite-compatible successor
- Mirage factories and config should carry over

### Remove (Redundant)

**`ember-concurrency-decorators`** — ember-concurrency 2.x+ includes decorators natively

**`loader.js`** — AMD loader, unnecessary with Vite

### Replace with Native

**`ember-lodash` → `lodash-es`** — direct ESM imports

**`@ember/string` → native string methods**

**`tracked-built-ins`** — keep for now, replace with `@ember/reactive/collections` after reaching 6.8 (issue #6)

### Evaluate

**`ember-modal-dialog` + `ember-tether`** — if modals can use `<BsModal>` (already available), remove both. Otherwise verify compat and defer.

## Acceptance Criteria

- [ ] Vite-incompatible addons replaced
- [ ] Redundant addons removed
- [ ] Deprecated addons replaced with native equivalents
- [ ] `pnpm test:ember` passes
