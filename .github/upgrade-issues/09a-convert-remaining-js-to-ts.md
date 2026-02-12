---
title: "Convert remaining .js files to TypeScript"
labels: ["upgrade", "typescript", "sprint-3"]
depends_on: [9]
---

## Summary

~28 app/ .js files, ~15 mirage .js files, and ~80+ test .js files remain unconverted. The TypeScript conversion (Issues 01-03) covered models, services, routes, controllers, and components, but skipped adapters, serializers, helpers, initializers, utilities, mirage infrastructure, and all test files.

## Scope

### App files (~28) — Priority 1

**Adapters & Serializers** (3):
- `app/adapters/application.js`
- `app/adapters/file.js`
- `app/serializers/application.js`

**Helpers** (8):
- `app/helpers/format-date.js`
- `app/helpers/format-oap-compliance.js`
- `app/helpers/includes.js`, `filter-by.js`, `intersect.js`, `is-equal.js`, `map-by.js`, `object-at.js` (Vite shims for ember-composable-helpers)

**Initializers** (3):
- `app/initializers/pass-api-inflector.js`
- `app/instance-initializers/error-handler.js`
- `app/instance-initializers/surveyjs.js`

**Transforms** (4):
- `app/transforms/date.js`, `boolean.js`, `number.js`, `string.js` (Ember Data legacy import re-exports from Issue #6)

**Auth** (2):
- `app/authenticators/http-only.js`
- `app/session-stores/application.js`

**Utilities** (2):
- `app/util/paginated-query.js`
- `app/util/strip-empty-arrays.js`

**App infrastructure** (4):
- `app/app.js`
- `app/router.js`
- `app/font-awesome.js`
- `app/deprecation-workflow.js`

**Services** (1):
- `app/services/store.js` (re-export shim from Issue #6)

**Config** (1 — app-level):
- `app/config/environment.js` — Vite runtime config, may need to stay .js

### Mirage files (~15) — Priority 2

- `app/mirage/config.js`
- `app/mirage/service-handler.js`
- `app/mirage/serializers/application.js`
- `app/mirage/scenarios/shared.js`
- `app/mirage/routes/schemas.js`
- Factories (5): journal, policy, publication, repository, submission
- Fixtures (7): funder, grant, journal, policy, publication, repository, submission, user

### Test files (~80+) — Priority 3

All test files remain .js. Converting provides type safety in tests but is lower priority than app code. Can be done incrementally.

### Must stay .js (build/config)

- `config/environment.js` — Ember build config, loaded by ember-cli
- `config/targets.js` — Browser targets
- `config/dependency-lint.js` — Lint config
- `babel.config.cjs` — Babel config (CJS)
- `vite.config.mjs` — Vite config (ESM)
- `.eslintrc.js`, `.prettierrc.js`, `.template-lintrc.js` — Tool configs

## Approach

- Same rules as original TS conversion: `allowJs: true`, add types, no runtime changes
- For simple re-export shims (transforms, store.js): just rename and add types
- For adapters/serializers: add `any` for framework types, proper types for our model types
- Tests: straightforward rename + add types to test helpers/assertions

## Acceptance Criteria

- [ ] Zero .js files in `app/` (excluding `app/config/environment.js` if it must stay)
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
