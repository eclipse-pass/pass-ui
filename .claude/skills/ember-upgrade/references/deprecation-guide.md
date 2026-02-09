# Deprecation Workflow & Lint-to-the-Future Reference

## ember-cli-deprecation-workflow

### Installation

```bash
pnpm add -D ember-cli-deprecation-workflow
```

### Capturing Deprecations

1. Start the app: `pnpm start`
2. Navigate through the app to trigger deprecations (or run the test suite).
3. Open the browser console and run:
   ```js
   deprecationWorkflow.flushDeprecations()
   ```
4. Copy the output.
5. Create or update `config/deprecation-workflow.js` with the output.

### Configuration File

```js
// config/deprecation-workflow.js
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  // Set to true to throw on any deprecation not in the workflow list
  throwOnUnhandled: false,
  workflow: [
    { handler: 'silence', matchId: 'ember-data:deprecate-early-static' },
    { handler: 'silence', matchId: 'ember-data:deprecate-promise-many-array-behaviors' },
    { handler: 'silence', matchId: 'deprecated-run-loop-and-computed-dot-access' },
    // Add all captured deprecation IDs here
  ],
};
```

### Resolution Strategy

Work through deprecations in priority order:

#### Priority 1: Deprecations Removed in Next Major Version
These will become hard errors on upgrade. Fix first.

#### Priority 2: Deprecations with Codemods
These can be fixed efficiently at scale.

#### Priority 3: Deprecations in App Code
Easier to fix than those in addons.

#### Priority 4: Deprecations from Addons
May require upgrading the addon or finding alternatives.

### Workflow Per Deprecation

1. Set the target deprecation handler to `'throw'`
2. Run the test suite — all instances surface as test failures
3. Fix each instance (use codemod if available)
4. Verify tests pass
5. Remove the entry from the workflow config (or leave as `'log'` for monitoring)
6. Commit

### Common Ember 5.x Deprecations

#### `this.get()` / `this.set()` on Native Classes
**ID:** `ember-object.get` / `ember-object.set`
**Fix:** Replace with direct property access:
```js
// Before
this.get('propertyName')
set(this, 'propertyName', value)

// After
this.propertyName
this.propertyName = value
```

For nested paths (`this.get('deeply.nested.path')`), use optional chaining:
```js
this.deeply?.nested?.path
```

#### Computed Property Access via `.get()`
**ID:** `computed-property.get`
**Fix:** Same as above — use direct property access.

#### `@computed` Decorator
**Fix:** Replace with native getter + `@tracked`:
```js
// Before
@computed('firstName', 'lastName')
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}

// After
// Ensure firstName and lastName are @tracked
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}
```

#### Classic Component Lifecycle Hooks
**Fix:** Migrate to Glimmer components with modifiers:
- `didInsertElement` → `{{did-insert}}` modifier
- `didRender` / `didUpdate` → `{{did-update}}` modifier
- `willDestroyElement` → `{{will-destroy}}` modifier or `willDestroy()` on Glimmer component

#### `{{action}}` Modifier/Helper
**ID:** `ember-template.action`
**Fix:** Replace with `{{on}}` + `{{fn}}`:
```hbs
{{!-- Before --}}
<button {{action "save"}}>Save</button>
<button {{action "delete" @item}}>Delete</button>

{{!-- After --}}
<button {{on "click" this.save}}>Save</button>
<button {{on "click" (fn this.delete @item)}}>Delete</button>
```

#### Implicit `this` in Templates
**ID:** `ember-template.no-implicit-this`
**Fix:** Add explicit `this.` prefix or `@` for args:
```hbs
{{!-- Before --}}
{{myProperty}}
{{myArg}}

{{!-- After --}}
{{this.myProperty}}
{{@myArg}}
```

**Codemod:** `ember-no-implicit-this-codemod`

#### Ember Data Deprecations
Many Ember Data deprecations relate to async relationship handling and static method usage. These are version-specific — consult the Ember Data changelog for the target version.

### Useful Codemods

```bash
# Convert to native class syntax
npx ember-native-class-codemod app/

# Fix implicit this in templates
npx ember-no-implicit-this-codemod app/

# Convert computed properties to tracked + getters
# (Manual — no universal codemod, but eslint can flag them)

# Convert {{action}} to {{on}}
# (Manual or partial codemod via ember-template-lint --fix)
```

## lint-to-the-future

### Installation

```bash
pnpm add -D lint-to-the-future lint-to-the-future-eslint lint-to-the-future-ember-template
```

### Setup

Add to `.eslintrc.js`:
```js
{
  plugins: ['lint-to-the-future'],
  // The plugin reads .lint-to-the-future-ignore files automatically
}
```

Add to `.template-lintrc.js`:
```js
module.exports = {
  plugins: ['lint-to-the-future-ember-template'],
  // ...
};
```

### Ignoring Existing Violations

After enabling a new or stricter rule:

```bash
# Generate ignore files for all current violations
npx lint-to-the-future ignore
```

This creates `.lint-to-the-future-ignore.json` files (or similar) that tell the linters to skip known violations.

### Tracking Progress

```bash
# Generate output showing violation counts over time
npx lint-to-the-future output
```

This creates a dashboard (HTML or JSON) showing how many violations remain for each rule.

### Workflow for Rule Upgrades

1. Upgrade `eslint-plugin-ember` or `ember-template-lint` to the new version.
2. Run linting — observe all new violations.
3. Run `npx lint-to-the-future ignore` to suppress existing violations.
4. Commit the rule upgrade + ignore files together.
5. All new code must comply. Old violations are documented and can be fixed over time.
6. Create cleanup PRs that fix violations and remove ignore entries.
7. Run `npx lint-to-the-future output` periodically to track progress.

### Integration with CI

Add a CI step that runs lint-to-the-future output and fails if violation count increases:

```bash
# In CI — ensure no new violations are introduced
npx lint-to-the-future output --format json
# Compare with baseline — fail if count increased
```

### Combining with GJS Migration

When adding GJS/GTS support to the lint config:
1. Add `.gjs`/`.gts` overrides to ESLint config
2. Run `npx lint-to-the-future ignore` to baseline existing `.js`/`.hbs` violations
3. New `.gjs` files must comply with all rules from the start
4. Track `.hbs` → `.gjs` conversion progress via violation counts decreasing

## Putting It All Together: Upgrade Sequence

### Phase 1: Foundation
1. Set up `ember-cli-deprecation-workflow`, capture all current deprecations
2. Set up `lint-to-the-future`, baseline current violations
3. Commit both — this is non-destructive and provides visibility

### Phase 2: Deprecation Cleanup
1. Work through deprecations by priority (next-major-removed first)
2. Use codemods where available
3. Each deprecation fix is its own PR

### Phase 3: GJS Migration
1. Add `ember-template-imports` and lint config
2. Use lint-to-the-future to baseline
3. Convert components leaf-first
4. Each component conversion is its own commit/PR

### Phase 4: Vite Migration
1. Verify Embroider compatibility flags are all true
2. Audit addon compatibility
3. Swap Webpack for Vite
4. Verify everything works

### Phase 5: Ongoing
1. Monitor lint-to-the-future dashboard
2. Chip away at remaining violations
3. Keep deprecation workflow updated as new Ember versions release
