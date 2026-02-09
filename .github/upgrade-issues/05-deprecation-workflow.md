---
title: "Set up deprecation workflow and capture remaining deprecations"
labels: ["upgrade", "sprint-2"]
depends_on: [4]
---

## Summary

With the app fully modernized (GTS, TypeScript, Vite) but still on Ember 5.8, run the deprecation workflow to capture exactly what remains. This output informs the version upgrade in issue #6.

## Blocked By

- #4 — Vite migration (modernize fully before capturing deprecations)

## Steps

### 1. Configure deprecation workflow

`ember-cli-deprecation-workflow` is already a devDependency.

### 2. Capture deprecations

```bash
pnpm start
# In browser console:
deprecationWorkflow.flushDeprecations()
```

Also run the test suite to capture test-only deprecations.

### 3. Generate config

Copy output to `config/deprecation-workflow.js`. Set all handlers to `'silence'`.

### 4. Review the list

The GTS conversion should have already resolved:
- `{{action}}` helper/modifier (strict mode forces `{{on}}`)
- Component template resolution (no more loose `.hbs` templates)

Verify these are absent. The remaining deprecations will likely be:
- Ember Data patterns
- Addon-sourced deprecations
- Any patterns not caught during static analysis

### 5. Categorize by "until" version

Mark which deprecations target 6.0 removal (must fix before upgrade) vs later versions (can defer).

## Acceptance Criteria

- [ ] `config/deprecation-workflow.js` exists with all deprecations captured
- [ ] Each deprecation categorized as 6.0-blocker or deferrable
- [ ] Document feeds directly into issue #6
