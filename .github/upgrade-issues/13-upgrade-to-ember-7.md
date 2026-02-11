---
title: "Upgrade to Ember 7.0"
labels: ["upgrade", "ember-7", "sprint-4"]
depends_on: [11, 12]
---

## Summary

The final step: upgrade ember-source to 7.0. By this point, all deprecation sources should be eliminated, all v1 addons removed, legacy patterns cleaned up, and WarpDrive migration complete.

## Blocked By

- #11 — WarpDrive migration (data layer must be on store.request())
- #12 — Clear deprecations + 6.12 upgrade (zero deprecation warnings)

## Ember 7.0 Breaking Changes

### Removed in 7.0 (already addressed)

| Removal | Addressed In |
|---|---|
| `import Ember from 'ember'` barrel file (~100+ re-exports) | #10 (v1 addon removal) |
| `import { inject as service }` (renamed to `service`) | #10 (addon code only) |
| `{{action}}` helper in templates | #10 (addon code only, app has zero usage) |
| AMD bundles | N/A (app uses Vite) |
| `@ember/object/computed` (`@computed`, `@alias`) | #9 (legacy cleanup) |
| `get()`/`set()` from `@ember/object` | #9 (legacy cleanup) |
| `@observes` | #9 (legacy cleanup) |
| Classic component lifecycle hooks | N/A (app is all Glimmer) |
| `Ember.Object.extend()` mixins | #9 (Transform.extend cleanup) |

### Potential Surprises

- Peer dependency version bumps in remaining addons
- `@ember/test-helpers`, `ember-qunit` may need major bumps
- Any remaining v1 addons in devDependencies (test helpers, etc.)

## Steps

### 1. Upgrade ember-source

```bash
pnpm add ember-source@^7.0.0
pnpm install
```

### 2. Upgrade companion packages

```bash
pnpm add @ember/test-helpers@latest ember-qunit@latest
pnpm add ember-data@latest  # or @warp-drive packages
```

### 3. Fix breaking changes

Run `pnpm test:ember` and fix anything that breaks. Expected: minimal changes since all deprecations were pre-resolved.

### 4. Update remaining dependencies

Check all Ember-ecosystem dependencies for 7.0-compatible versions:
- `ember-concurrency`
- `ember-simple-auth`
- `ember-file-upload`
- `ember-page-title`
- `ember-modifier`
- `tracked-built-ins`
- etc.

## Acceptance Criteria

- [ ] `ember-source` at `^7.0.0`
- [ ] All Ember ecosystem deps at 7.0-compatible versions
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
- [ ] `pnpm build` — production build succeeds
- [ ] `pnpm build:docker` — Docker image builds and runs
- [ ] Manual smoke test: full submission workflow
- [ ] Zero deprecation warnings (workflow empty, throwOnUnhandled: true)
