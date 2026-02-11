---
title: "Remove and replace v1 addons"
labels: ["upgrade", "addons", "sprint-3"]
depends_on: [9]
---

## Summary

Remove all v1 addons that produce the 12 silenced deprecations in the workflow. These deprecations come from addon code (not app code) and will become hard errors in Ember 7.0. Also replace ember-models-table with custom Glimmer table components.

## Blocked By

- #9 — Legacy pattern cleanup (controllers must use modern tracked state before table replacement)

## Key Finding: ember-bootstrap Components Are NOT Used

The app has `ember-bootstrap` installed but uses **zero** Bs* components. It only uses:
- Bootstrap 5 CSS (imported directly: `import 'bootstrap/dist/css/bootstrap.css'`)
- A wormhole div needed by `ember-modal-dialog`

Removal is trivial.

## V1 Addon Inventory

| Addon | Status | Action | Surface Area |
|---|---|---|---|
| `ember-bootstrap` | Installed, unused for components | **Remove** | Config only |
| `ember-modal-dialog` + `ember-tether` | v1, no v2 | **Replace** with native `<dialog>` | 2 components |
| `ember-models-table` | v1, no v2 | **Replace** with custom tables | 4 templates + theme service |
| `@ember/render-modifiers` | v1 | **Replace** with `ember-modifier` | 9 components |
| `ember-power-select` | v1 at 7.x, v2 at 8.x | **Upgrade** to 8.x | 1 component |
| `ember-cli-flash` | v1 at 4.x, v2 at 7.x | **Upgrade** to 7.x | 12 files |
| `ember-inflector` | v1 at 4.x, v2 at 6.x | **Upgrade** to 6.x | Inflector config |

## PRs

### PR A: Remove ember-bootstrap

1. Remove `ember-bootstrap` config from `ember-cli-build.js` (lines 28-33)
2. Remove `ember-bootstrap` from `package.json`
3. Remove the `require` alias in `vite.config.mjs` (shim for ember-bootstrap's AMD require)
4. Remove from `optimizeDeps.exclude` in vite config
5. Delete `require-shim.js` if only needed by ember-bootstrap
6. Keep `import 'bootstrap/dist/css/bootstrap.css'` in `app/app.js` (the actual CSS)
7. Remove `<div id='ember-bootstrap-wormhole'>` from `app/templates/application.gts` (if ember-modal-dialog provides its own, or defer to PR B)

### PR B: Remove ember-modal-dialog + ember-tether → native `<dialog>`

**Current usage** (2 components):
- `app/components/message-dialog/index.gts` — Form modal with to/subject/message fields
- `app/components/workflow-basics/index.gts` — User search modal

**Replacement**: Native HTML `<dialog>` element with `showModal()`/`close()`. Build a thin `<NativeDialog>` Glimmer component or inline the `<dialog>` element directly.

```gts
<dialog {{didInsert this.setupDialog}} {{didUpdate this.syncDialog @isOpen}}>
  {{yield}}
</dialog>
```

**Also remove**:
- `ember-modal-dialog` and `ember-tether` from `package.json`
- Related CSS imports/aliases in vite config
- The wormhole div from `application.gts` (no longer needed)

### PR C: Replace ember-models-table with custom table components

**Build 2 new Glimmer components**:

1. **`<DataTable>`** — Client-side table with optional multi-select
   - Used by: `app/components/workflow-grants/index.gts`
   - Features: column definitions, custom cell components, multi-select, pagination

2. **`<ServerPaginatedTable>`** — Server-paginated table
   - Used by: `app/templates/grants/index.gts`, `app/templates/grants/detail.gts`, `app/templates/submissions/index.gts`
   - Features: server pagination callbacks, global filter, single-column sort, page size selector, custom cell components

**Column definition format** (keep compatible with existing controller definitions):
```typescript
interface ColumnDef {
  propertyName?: string;
  title: string;
  className?: string;
  component?: string;
  disableSorting?: boolean;
  disableFiltering?: boolean;
  filterWithSelect?: boolean;
  predefinedFilterOptions?: string[];
  mayBeHidden?: boolean;
}
```

**Custom cell components** (13 total, already GTS — no changes needed):
`date-cell`, `grant-link-newtab-cell`, `grant-link-cell`, `pi-list-cell`, `grant-submission-cell`, `grant-action-cell`, `submissions-article-cell`, `submissions-award-cell`, `submissions-repo-cell`, `submissions-status-cell`, `submissions-repoid-cell`, `submission-action-cell`, `select-row-toggle`

**Also remove**:
- `ember-models-table` from `package.json`
- `@nullvoxpopuli/ember-composable-helpers` pnpm override
- Inline helper shims: `app/helpers/includes.js`, `filter-by.js`, `intersect.js`, `is-equal.js`, `map-by.js`, `object-at.js`
- `app/services/emt-themes/pass-table-theme.ts` and the `emt-themes` directory
- `@service('emt-themes/pass-table-theme') themeInstance` from all controllers

### PR D: Replace @ember/render-modifiers with custom modifiers

**9 component files** use `did-insert` and `did-update` from `@ember/render-modifiers`.

**Replacement**: Create `app/modifiers/did-insert.ts` and `app/modifiers/did-update.ts` using `ember-modifier` (already installed, v2):
```typescript
import { modifier } from 'ember-modifier';
export default modifier((element, [callback]) => {
  callback(element);
});
```

Update imports in all 9 files from `@ember/render-modifiers/modifiers/did-insert` to `pass-ui/modifiers/did-insert`.

**Files**: `workflow-grants`, `workflow-review`, `metadata-form`, `submissions-repoid-cell`, `workflow-repositories`, `policy-card`, `display-metadata-keys`, `nav-bar`, `workflow-metadata`

### PR E: Upgrade ember-power-select 7 → 8

- Only used in `app/components/find-journal/index.gts`
- v8 is a v2 addon — Vite-compatible
- Check for API changes in args/events
- Remove related `ember-get-config` and `ember-basic-dropdown` shims from vite config if no longer needed

### PR F: Upgrade ember-cli-flash 4 → 7

- Used in 12 files via `flashMessages` service
- v7 is a v2 addon
- API likely stable (`.warning()`, `.danger()`, `.success()`)
- Check for breaking changes in flash message component imports

### PR G: Upgrade ember-inflector 4 → 6

- v6 is a v2 addon
- Direct import in `app/serializers/application.js`: `import { singularize } from 'ember-inflector'`
- Verify import path compatibility

## Acceptance Criteria

- [ ] Zero v1 addons producing deprecation warnings
- [ ] `ember-bootstrap` removed
- [ ] `ember-modal-dialog` + `ember-tether` removed
- [ ] `ember-models-table` removed, replaced with custom `<DataTable>` and `<ServerPaginatedTable>`
- [ ] `@ember/render-modifiers` removed
- [ ] `ember-power-select` at v8 (v2)
- [ ] `ember-cli-flash` at v7 (v2)
- [ ] `ember-inflector` at v6 (v2)
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
- [ ] Manual smoke test of all 4 table views + modal dialogs
