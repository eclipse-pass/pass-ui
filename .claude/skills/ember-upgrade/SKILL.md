---
name: ember-upgrade
description: This skill should be used when the user asks to "upgrade Ember", "migrate to GJS", "migrate to GTS", "convert to template tag components", "add Vite", "migrate to Vite", "set up deprecation workflow", "fix Ember deprecations", "set up lint-to-the-future", "migrate to Embroider", "upgrade ember-source", "modernize Ember app", or discusses any Ember.js version upgrade, build system migration, or deprecation remediation strategy.
version: 0.1.0
---

# Senior Staff Ember.js Upgrade Engineer

Operate as a senior staff Ember.js and JavaScript engineer with deep expertise in Ember's upgrade ecosystem. Apply disciplined, incremental upgrade strategies — never attempt multiple migration axes simultaneously. Each change should be independently verifiable before moving to the next.

## Core Upgrade Philosophy

Upgrades succeed when they are boring. Make the smallest possible change, verify it works, commit, repeat. Resist the urge to "fix everything at once." The recommended upgrade sequence for this codebase (Ember 5.8, Embroider + Webpack):

1. **GJS/GTS migration** — Convert components to template tag format
2. **Vite migration** — Replace Webpack with @embroider/vite
3. **Deprecation workflow** — Capture and systematically resolve deprecations
4. **Lint-to-the-future** — Upgrade lint rules without fixing every violation at once

These can be pursued in parallel tracks but each individual PR should focus on one axis.

## GJS/GTS Template Tag Components

GJS (`.gjs`) and GTS (`.gts`) are single-file component formats where the template is co-located inline using `<template>` tags. This replaces the separate `.js` + `.hbs` file pattern.

### Syntax

```gjs
// app/components/greeting.gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

export default class Greeting extends Component {
  @tracked count = 0;

  increment = () => this.count++;

  <template>
    <h1>Hello, {{@name}}</h1>
    <p>Count: {{this.count}}</p>
    <button {{on "click" this.increment}}>+1</button>
  </template>
}
```

### Template-only in GJS

```gjs
// No class needed — just export a template
<template>
  <div class="card">{{yield}}</div>
</template>
```

### Key Rules

- In strict mode (GJS/GTS default), **all** helpers, modifiers, and components must be explicitly imported. No implicit globals.
- Commonly needed imports: `{{on}}` from `@ember/modifier`, `{{fn}}` and `{{hash}}` and `{{array}}` from `@ember/helper`, `{{not}}` / `{{and}}` / `{{or}}` from `ember-truth-helpers`.
- Multiple components can be defined in one file. Only the `export default` is public; others are file-private.
- The `<template>` tag is not a real HTML element — it is a compiler primitive. It compiles away.
- When converting existing `.js` + `.hbs` pairs: move the template content into a `<template>` block inside the class body, add explicit imports for everything the template references, delete the `.hbs` file.
- For this codebase, convert one component at a time. Each conversion is a standalone PR or commit.

### Migration Strategy

1. Install `ember-template-imports` if not already present (check if ember-source version includes it natively).
2. Configure ESLint and template-lint for `.gjs`/`.gts` files (`eslint-plugin-ember` 12+ supports them).
3. Start with leaf components (no child components) and work inward.
4. Use `ember-template-lint --fix` and codemods where available.
5. Audit each template for implicit globals — these become explicit imports in strict mode.

## Vite Migration (@embroider/vite)

Replace Webpack with Vite for dramatically faster dev rebuilds and HMR. This codebase currently uses Embroider + Webpack (`@embroider/webpack`).

### Prerequisites

- Embroider v3+ (this app uses Embroider already — verify version).
- All addons must be v2 format or have Embroider compatibility shims.
- `staticAddonTrees`, `staticAddonTestSupportTrees`, `staticHelpers`, `staticModifiers`, `staticComponents` compatibility flags should all be `true` before migrating.

### Migration Path

1. Audit current `ember-cli-build.js` for Embroider config and compatibility flags.
2. Upgrade `@embroider/core`, `@embroider/compat`, `@embroider/webpack` to latest v3.
3. Verify the app builds and tests pass on latest Embroider + Webpack.
4. Replace `@embroider/webpack` with `@embroider/vite` in dependencies.
5. Create `vite.config.mjs` with Embroider's Vite plugin.
6. Update `package.json` scripts to use Vite dev server.
7. Remove Webpack-specific configuration.
8. Verify build, dev server, and all tests pass.

### Vite Config Shape

```js
// vite.config.mjs
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    extensions(),
  ],
  build: {
    target: ['es2021', 'chrome100', 'firefox100', 'safari15'],
  },
});
```

Consult `references/vite-migration.md` for detailed configuration and troubleshooting.

## Deprecation Workflow

`ember-cli-deprecation-workflow` provides a systematic way to capture all active deprecations and resolve them one at a time without noise.

### Setup and Usage

1. Install: `pnpm add -D ember-cli-deprecation-workflow`
2. Start the app in development.
3. Open browser console, run: `deprecationWorkflow.flushDeprecations()`
4. Copy the output to `config/deprecation-workflow.js`.
5. Each deprecation entry has a `handler` — set to `'silence'`, `'log'`, or `'throw'`.
6. Start with all set to `'silence'`. Then pick one deprecation, set its handler to `'throw'`, fix all occurrences, commit. Repeat.

### Config Shape

```js
// config/deprecation-workflow.js
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-data:deprecate-early-static' },
    { handler: 'throw', matchId: 'deprecated-run-loop-and-computed-dot-access' },
    // ... one entry per deprecation
  ],
};
```

### Strategy

- Address deprecations by "until" version — fix the ones that will be removed soonest.
- Some deprecations have codemods. Check the deprecation guide at `https://deprecations.emberjs.com` for each ID.
- Run the test suite with a deprecation set to `'throw'` to find all occurrences in tests too.

## Lint-to-the-Future

`lint-to-the-future` allows upgrading lint configurations (ESLint rules, template-lint rules) without being forced to fix every existing violation first.

### Setup and Usage

1. Install: `pnpm add -D lint-to-the-future lint-to-the-future-eslint lint-to-the-future-ember-template`
2. Enable the new/stricter lint rules in config.
3. Run: `npx lint-to-the-future ignore` — this generates ignore entries for all existing violations.
4. Commit the ignore files alongside the rule changes.
5. New code must comply with the new rules. Old violations are tracked and can be fixed incrementally.
6. Run: `npx lint-to-the-future output` to generate a dashboard showing progress over time.

### Integration with Upgrades

- When upgrading `eslint-plugin-ember` or `ember-template-lint` to versions with new rules, use lint-to-the-future to adopt the rules immediately without a massive fix-everything PR.
- Track violation counts over time. Chip away at them in dedicated cleanup PRs.
- This is especially valuable when adopting GJS/GTS lint rules — existing `.hbs` files won't immediately comply.

## Upgrade Decision Framework

When evaluating any upgrade step:

1. **Read the changelog/upgrade guide** for the target version before writing any code.
2. **Check addon compatibility** — use `ember-try` or manually verify key addons work with the target.
3. **One concern per PR** — never mix "upgrade ember-source" with "convert components to GJS" in one PR.
4. **Tests are the gate** — if the test suite doesn't pass, the upgrade step isn't done.
5. **Codemods first, manual fixes second** — always check if a codemod exists before hand-editing files.

## Additional Resources

### Reference Files

For detailed migration guides and troubleshooting:
- **`references/gjs-migration.md`** — Detailed GJS/GTS conversion patterns, common pitfalls, import reference
- **`references/vite-migration.md`** — Step-by-step Vite migration, addon compatibility, config details
- **`references/deprecation-guide.md`** — Common Ember deprecations, their fixes, and relevant codemods
