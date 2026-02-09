---
title: "Convert full app to GTS + TypeScript (with legacy cleanup)"
labels: ["upgrade", "typescript", "gts", "sprint-1"]
depends_on: [1]
---

## Summary

Convert the entire application to TypeScript on the stable Ember 5.8 base. **Full GTS — zero `.hbs` files.** Components AND route templates become `.gts`, all other files become `.ts`. Legacy patterns (get/set, @computed, @alias, @observes) are fixed in each file as it's converted — one touch per file.

Since everything is strict-mode GTS, we only need `@glint/environment-ember-template-imports` — no loose-mode Glint environment needed.

This is the largest issue. Break into sub-PRs by file category.

## Blocked By

- #1 — TypeScript + GTS infrastructure

## Approach

Run `npx @embroider/template-tag-codemod --defaultFormat gts` for mechanical component conversion, then manually complete each file.

For every file:
1. Rename/convert (`.js` → `.ts`, or `.js` + `.hbs` → `.gts`)
2. Add type annotations (args interfaces, service types, return types)
3. Fix legacy patterns in the same pass
4. For `.gts`: add explicit imports for strict-mode templates (`on`, `fn`, `hash`, `perform`, addon components)
5. Verify tests pass

## Legacy Patterns Fixed Per-File

| Pattern | Count | Fix |
|---------|-------|-----|
| `get(this, 'x')` / `set(this, 'x', v)` | 113 | `this.x` / `this.x = v` |
| `@computed('dep')` | 23 | native getter |
| `@alias('model.x')` | 30 | `get x() { return this.model.x; }` |
| `this.set('x', v)` | 11 | `this.x = v` |
| `@observes('x')` | 2 | tracked + getter or task |
| `setProperties(this, {...})` | 2 | individual assignments |
| `Transform.extend({})` | 1 | native class |
| `Ember.onerror` | 1 | review |
| `{{action}}` in templates | 56 | `{{on}}` + `{{fn}}` (forced by strict mode) |
| `sendAction` | 3 | callback args |

Note: The `{{action}}` migration (which is the hard 6.0 blocker) happens naturally during GTS conversion because strict mode requires explicit `{{on}}` imports. This is a key benefit of doing GTS first.

## Conversion Order

### PR 1: Models → `.ts` (7+ files)

- `submission.ts` — 8 @computed, 5 get(), 3 this.set()
- `publication.ts`, `repository.ts`, `grant.ts`, `user.ts`, `policy.ts`, `journal.ts`, `funder.ts`, `deposit.ts`, `file.ts`, `repository-copy.ts`, `submission-event.ts`

Type annotations: `@attr('string') declare name: string`, `@belongsTo('user', {...}) declare submitter: User`

### PR 2: Services → `.ts` (10+ files)

- `submission-handler.ts` — 6 get(), 6 set(), 6 this.set()
- `workflow.ts` — 6 set()
- `metadata-schema.ts`, `doi.ts` (2 get()), `policies.ts` (3 get()), `error-handler.ts`, `current-user.ts`, `app-static-config.ts`, `search-helper.ts` (1 get, 1 set), `autocomplete.ts`, `oa-manuscript-service.ts`

### PR 3: Routes + Controllers → `.ts` (15+ files)

**Controllers (heavy legacy):**
- `submissions/detail.ts` — 28 get(), 1 set(), 2 @computed
- `submissions/new/basics.ts` — 19 get(), 9 set(), 4 @computed, 4 @alias
- `submissions/new/repositories.ts` — 4 get(), 2 set(), 3 @alias
- `submissions/new/policies.ts` — 4 @alias
- `submissions/new/metadata.ts` — 4 @alias
- `submissions/new/grants.ts` — 3 @alias
- `submissions/new/files.ts` — 3 get(), 2 set(), 2 @computed, 3 @alias
- `submissions/new/review.ts` — 2 @computed, 3 @alias
- `submissions/new.ts` — 3 set()
- `application.ts` — 1 @alias
- `dashboard.ts` — 1 get()

**Routes:** All route files → `.ts` with model() return types

### PR 4: Components → `.gts` (44+ files)

Run codemod first. Leaf-first order:

1. **Simple display** (~10): `grant-link-cell`, `submission-action-cell`, `oap-compliance-cell`, `submissions-repoid-cell`, `submissions-author-cell`, `pi-list-cell`, `submission-repo-details`, `message-dialog`, `external-repo-review`, `found-manuscripts`
2. **Workflow steps** (~7): `workflow-basics` (9 get, 3 set, 5 @alias, 1 setProperties), `workflow-grants` (3 get, 2 set), `workflow-policies`, `workflow-repositories`, `workflow-review` (4 get), `workflow-metadata`, `workflow-files`
3. **Cards/forms** (~5): `policy-card` (4 get, 2 set, 5 @computed), `repository-card`, `metadata-form`, `workflow-basics-user-search`, others
4. **Layout**: `nav-bar` (1 get)

Each component gets a Signature interface:
```ts
interface MyComponentSignature {
  Args: { submission: Submission; onSave: (sub: Submission) => void };
  Blocks: { default: [] };
  Element: HTMLDivElement;
}
```

### PR 5: Route Templates → `.gts`

Route templates in `app/templates/` become `.gts` files using `ember-route-template` (from Discourse). This addon bridges the gap until native GTS route template support in Ember 6.3+.

```ts
// app/templates/dashboard.gts
import RouteTemplate from 'ember-route-template';
import Dashboard from '../components/dashboard';

export default RouteTemplate(<template>
  <Dashboard @model={{@model}} />
</template>);
```

Templates receive `@model` and `@controller` as args. For Glint typing, pass a signature generic: `RouteTemplate<{ model: MyModel }>(...)`.

After upgrading to 6.3+ (issue #6), `ember-route-template` can be removed and the `RouteTemplate()` wrapper dropped in favor of native GTS route templates.

Route templates to convert:
- `app/templates/application.hbs`
- `app/templates/dashboard.hbs`
- `app/templates/submissions/detail.hbs`
- `app/templates/submissions/new.hbs`
- `app/templates/submissions/new/basics.hbs`, `grants.hbs`, `policies.hbs`, `repositories.hbs`, `metadata.hbs`, `files.hbs`, `review.hbs`
- `app/templates/grants/detail.hbs`
- `app/templates/thanks.hbs`
- `app/templates/not-found-error.hbs`
- Any `loading.hbs` / `error.hbs` substates

### PR 6: Helpers, Transforms, Initializers → `.ts`

- `search-associated.ts` — **full rewrite** (2 @observes, setProperties, this.set)
- `format-date.ts`
- `set.ts` transform — .extend() → native class
- `pass-api-inflector.ts`
- `surveyjs.ts`, `error-handler.ts` (review Ember.onerror)
- `http-only.ts` authenticator

### PR 7 (optional, time permitting): Tests → `.ts`

Lower priority — `.js` tests work fine against `.ts`/`.gts` source.

## Acceptance Criteria

- [ ] Zero `.js` files in `app/` (all `.ts` or `.gts`)
- [ ] **Zero `.hbs` files anywhere** — components AND route templates are `.gts`
- [ ] Zero `@computed`, `@alias`, `@observes` imports
- [ ] Zero `get()`/`set()` from `@ember/object`
- [ ] Zero `{{action}}` in templates
- [ ] Zero `sendAction`
- [ ] Only `@glint/environment-ember-template-imports` in Glint config (no loose-mode)
- [ ] `pnpm test:ember` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
