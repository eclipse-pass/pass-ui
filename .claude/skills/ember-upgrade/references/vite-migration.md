# Vite Migration Reference

## Current State Assessment (pass-ui)

This app already uses Embroider + Webpack. The migration to Vite replaces the Webpack bundler layer while keeping the Embroider compilation layer.

Current build stack:
- `ember-cli` — orchestrates the build
- `@embroider/compat` — transforms v1 addons to v2
- `@embroider/core` — Embroider compilation
- `@embroider/webpack` — bundles with Webpack

Target build stack:
- `@embroider/vite` — replaces `@embroider/webpack`
- `vite` — the bundler and dev server

## Pre-Migration Checklist

### 1. Verify Embroider Compatibility Flags

In `ember-cli-build.js`, all static analysis flags should be `true`:

```js
return require('@embroider/compat').compatBuild(app, Webpack, {
  staticAddonTrees: true,
  staticAddonTestSupportTrees: true,
  staticHelpers: true,
  staticModifiers: true,
  staticComponents: true,
  // skipBabel is for performance — not a compatibility flag
});
```

If any are `false` or missing, set them to `true` and verify the build still works **before** migrating to Vite. Each flag can surface issues independently.

### 2. Audit Addon Compatibility

Key addons to verify against Embroider v3 + Vite:
- `ember-bootstrap` — check for v2 addon format
- `ember-simple-auth` — verify Vite compatibility
- `ember-concurrency` — should work with Embroider v3
- `ember-file-upload` — verify
- `ember-power-select` — verify
- `survey-knockout-ui` (SurveyJS) — may need special handling (non-Ember library)
- `ember-modal-dialog` — verify or find alternative
- `ember-composable-helpers` — verify specific helpers used

Use `npx @embroider/compat audit` to identify addon compatibility issues.

### 3. Check for Dynamic `import()` and String-Based Lookups

Vite requires static imports to do proper code splitting. Search for:
- `{{component someString}}` — dynamic component lookup by string
- `this.owner.lookup('component:' + name)` — runtime lookup
- `require()` calls outside of build config

These need refactoring before Vite migration.

## Migration Steps

### Step 1: Upgrade Embroider Packages

```bash
pnpm add -D @embroider/core@latest @embroider/compat@latest @embroider/webpack@latest
```

Verify build and tests pass after the upgrade.

### Step 2: Install Vite and @embroider/vite

```bash
pnpm remove @embroider/webpack webpack
pnpm add -D vite @embroider/vite
```

### Step 3: Create vite.config.mjs

```js
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    classicEmberSupport(),
    ember(),
    extensions(),
  ],
  build: {
    target: ['es2021', 'chrome100', 'firefox100', 'safari15'],
    rollupOptions: {
      input: {
        main: 'index.html',
        tests: 'tests/index.html',
      },
    },
  },
  server: {
    port: 4200,
  },
}));
```

### Step 4: Update ember-cli-build.js

The Embroider section changes from using Webpack to just returning the app:

```js
// Before
const { Webpack } = require('@embroider/webpack');
return require('@embroider/compat').compatBuild(app, Webpack, { ... });

// After — ember-cli-build.js may become minimal or be replaced entirely
// depending on @embroider/vite version
const app = new EmberApp(defaults, { /* app options */ });
return app.toTree();
```

The exact shape depends on the `@embroider/vite` version — consult its README for the current approach.

### Step 5: Update index.html

Vite uses `index.html` as its entry point (not `app/index.html`). The file may need:

```html
<script type="module" src="/app/app.js"></script>
```

### Step 6: Update package.json Scripts

```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "test:ember": "vite build --mode test && ember test --path dist"
  }
}
```

### Step 7: Update testem.js

Tests may need adjustments depending on how Vite serves test files. The test HTML entry point and asset paths may differ.

### Step 8: Verify

1. `pnpm start` — dev server starts, app loads, HMR works
2. `pnpm build` — production build succeeds
3. `pnpm test:ember` — all tests pass
4. Check Docker build still works

## Common Issues

### CSS Import Order

Vite handles CSS differently from Webpack. If Bootstrap or other CSS imports break:
- Check that CSS import order in `ember-cli-build.js` or `app/styles/app.css` is correct
- Vite may need explicit CSS import in the app entry point

### Public Assets

Vite serves from `public/` by default. Verify that static assets (fonts, images, `config.json`) are accessible at the expected paths.

### Environment Variables

Vite uses `import.meta.env` instead of `process.env`. Ember's `config/environment.js` should still work through Embroider's compatibility layer, but verify that runtime environment variables resolve correctly.

### Proxy Configuration

If the dev server proxies API requests, configure in `vite.config.mjs`:

```js
server: {
  proxy: {
    '/data': 'http://localhost:8080',
    '/user': 'http://localhost:8080',
    '/file': 'http://localhost:8080',
  },
}
```

### SurveyJS / Third-Party Libraries

Non-Ember libraries imported via `ember-cli-build.js` `app.import()` may need different handling in Vite. Convert to standard ESM imports where possible.

## Rollback Plan

If Vite migration surfaces blocking issues:
1. Keep the Vite migration on a branch
2. Revert to `@embroider/webpack` on `main`
3. File issues against the blocking addons or `@embroider/vite`
4. Retry when blockers are resolved

The migration is a build-system swap — application code should not change. This makes rollback straightforward.
