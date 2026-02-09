---
title: "Fix remaining deprecations and upgrade to Ember 6.8 LTS"
labels: ["upgrade", "ember-6", "sprint-2"]
depends_on: [5]
---

## Summary

Using the deprecation workflow output from issue #5, systematically fix all 6.0-blocking deprecations, then upgrade ember-source to 6.8 LTS.

## Blocked By

- #5 — Deprecation workflow (need the list of what to fix)

## Steps

### 1. Fix 6.0-targeting deprecations

For each deprecation that targets removal in 6.0:
1. Set its handler to `'throw'` in `config/deprecation-workflow.js`
2. Run `pnpm test:ember` — all instances surface as failures
3. Fix all occurrences
4. Run tests — pass
5. Remove the entry from the workflow config
6. Commit

Check codemods before hand-fixing: https://deprecations.emberjs.com/

### 2. Verify 6.0 breaking changes

After fixing deprecations, confirm:
- [ ] Zero `{{action}}` usage (should be gone from GTS conversion)
- [ ] All routes with dynamic segments have explicit `model()` hooks
- [ ] No templates in `app/templates/components/`
- [ ] `EXTEND_PROTOTYPES: false` and no array extension usage

### 3. Upgrade incrementally

```bash
npx ember-cli-update --to 5.12
pnpm install && pnpm test:ember
# commit

npx ember-cli-update --to 6.0
pnpm install && pnpm test:ember
# commit

npx ember-cli-update --to 6.8
pnpm install && pnpm test:ember
# commit
```

### 4. Post-upgrade cleanup

- Remove `ember-route-template` — GTS route templates are native in 6.3+. Unwrap the `RouteTemplate()` calls and export the `<template>` directly.
- Replace `tracked-built-ins` with `@ember/reactive/collections` (built into 6.8)
- Remove `ember-template-imports` if not already removed during Vite migration (GTS is native with Vite)
- Address any new deprecation warnings introduced in 6.x

## Acceptance Criteria

- [ ] All 6.0-targeting deprecations resolved
- [ ] `ember-source` at `~6.8.0`
- [ ] `pnpm test:ember` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
