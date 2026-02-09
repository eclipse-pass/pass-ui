---
title: "Migrate build system from Embroider+Webpack to Vite"
labels: ["upgrade", "vite", "sprint-2"]
depends_on: [3]
---

## Summary

Replace `@embroider/webpack` with `@embroider/vite`. The app already has all Embroider static flags enabled. After this, `ember-template-imports` can be removed (GTS is native with Vite).

## Blocked By

- #3 — Addon housekeeping (Vite-incompatible addons replaced first)

## Steps

### 1. Run the codemod

```bash
npx ember-vite-codemod
```

### 2. Manual adjustments

- Review generated `vite.config.mjs`
- Update `package.json` scripts
- Remove: `@embroider/webpack`, `webpack`, `broccoli-asset-rev`, `ember-auto-import`, `ember-cli-terser`, `ember-cli-sri`, `ember-cli-clean-css`
- Remove `ember-template-imports` (GTS is native with Vite)
- Remove `@embroider/macros` pnpm override if no longer needed
- Verify CSS imports (Bootstrap, SurveyJS, SweetAlert2)
- Set up dev server proxy for API calls
- Verify Docker build

### 3. Verify

- `pnpm start` — Vite dev server, HMR works
- `pnpm build` — production build
- `pnpm test:ember` — all tests pass
- `pnpm build:docker` — Docker image

## Acceptance Criteria

- [ ] Webpack removed, Vite in place
- [ ] `ember-template-imports` removed (native with Vite)
- [ ] Build, tests, dev server, Docker all work
