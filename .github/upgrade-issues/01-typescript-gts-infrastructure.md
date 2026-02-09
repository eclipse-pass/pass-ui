---
title: "Set up TypeScript + GTS infrastructure on Ember 5.8"
labels: ["upgrade", "typescript", "gts", "sprint-1"]
---

## Summary

Add TypeScript and GTS (template-tag) support to the project while still on Ember 5.8. After this, `.ts` and `.gts` files work alongside existing `.js`/`.hbs`. No files are converted yet — that's issue #2.

## Steps

### 1. Install TypeScript dependencies

```bash
pnpm add -D typescript @tsconfig/ember @glint/core @glint/template @glint/environment-ember-template-imports
```

No `@glint/environment-ember-loose` needed — we're going full GTS (zero `.hbs` files), so everything is strict-mode only.

### 2. Install GTS support

On Embroider v3 + Webpack (our current build), GTS requires `ember-template-imports`. For route templates as GTS (which isn't native until Ember 6.3), use `ember-route-template` from Discourse:

```bash
pnpm add -D ember-template-imports
pnpm add ember-route-template
```

`ember-template-imports` goes away after Vite migration (issue #4), where GTS is native.
`ember-route-template` goes away after upgrading to 6.3+ (issue #6), where GTS route templates are native.

### 3. Create `tsconfig.json`

```json
{
  "extends": "@tsconfig/ember/tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "declarationMap": false,
    "emitDeclarationOnly": false,
    "allowJs": true,
    "checkJs": false
  },
  "glint": {
    "environment": ["ember-template-imports"]
  }
}
```

`allowJs: true` + `checkJs: false` enables incremental adoption.

### 4. Configure ESLint

Install `ember-eslint-parser` and `@typescript-eslint/parser`. Add overrides in `.eslintrc.js`:

```js
{
  files: ['**/*.ts'],
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
},
{
  files: ['**/*.gts'],
  parser: 'ember-eslint-parser',
  plugins: ['ember'],
  extends: ['plugin:ember/recommended'],
},
```

### 5. Verify

- `pnpm build` still works
- `pnpm lint` still works
- `pnpm test:ember` still passes

## Acceptance Criteria

- [ ] `typescript`, `ember-template-imports`, and `ember-route-template` in dependencies
- [ ] `tsconfig.json` exists with `allowJs: true`
- [ ] Glint configured
- [ ] ESLint handles `.ts` and `.gts`
- [ ] Existing build, lint, and tests unaffected
