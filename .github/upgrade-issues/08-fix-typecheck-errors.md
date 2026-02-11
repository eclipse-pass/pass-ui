---
title: "Fix remaining ~193 typecheck errors"
labels: ["upgrade", "typescript", "sprint-3"]
depends_on: [6]
---

## Summary

Achieve zero `pnpm typecheck` errors. The route template migration (issue #6 post-upgrade cleanup) eliminated ~200 "Property 'controller' does not exist" errors, leaving ~193. These must be resolved before legacy pattern cleanup (issue #9) since reliable type checking is a prerequisite for safe refactoring.

## Blocked By

- #6 — Upgrade to 6.8 (complete)

## Error Categories

### Component Signature Types (~120 errors)

Many GTS components lack proper `Args` interfaces. The type checker sees `{}` for args and flags every `@arg` reference.

**Files**: ~30 component `.gts` files in `app/components/`

**Pattern**:
```typescript
// Before — no signature, args typed as {}
<template>
  {{@record.title}}  // TS2339: Property 'record' does not exist on type '{}'
</template>

// After — proper signature
interface Signature {
  Args: {
    record: SubmissionModel;
  };
}
// prettier-ignore
<template>
  {{@record.title}}
</template> satisfies TemplateOnlyComponent<Signature>
```

**Key cell components needing signatures** (16 errors for `record`, 5 for `column`, 5 for `repoCopy`, 9 for `submissionStatus`):
- `date-cell`, `grant-link-cell`, `grant-link-newtab-cell`, `pi-list-cell`
- `grant-submission-cell`, `grant-action-cell`, `select-row-toggle`
- `submissions-article-cell`, `submissions-award-cell`, `submissions-repo-cell`
- `submissions-status-cell`, `submissions-repoid-cell`, `submission-action-cell`
- `repocopy-display`, `submission-status`, `submission-nav`
- `display-metadata-keys`, `notice-banner`, `nav-bar`

### Nullability Issues (~20 errors)

- `string | undefined` vs `string | null` mismatches on model attributes
- `number | undefined` vs `number` on pagination properties
- `UserModel | null` vs `UserModel` on currentUser

### Index Signature Access (~13 errors)

- `contactUrl`, `mimeType`, `fileRole` need bracket access (`obj['key']`) not dot access
- `config.branding.pages` possibly undefined — needs optional chaining

### WorkflowWrapper `@title` Arg (6 errors)

WorkflowWrapper's signature doesn't include `@title` but 6 route templates pass it. Either add `title` to the component's Args or remove it from templates if unused.

### Spread Arguments and Overloads (~9+7 errors)

- `Expected 0 arguments, but got 1` — helper/component invocations with untyped signatures
- `A spread argument must either have a tuple type` — `super.handleResponse(...arguments)` patterns

### ComponentLike Type Mismatches (4 errors)

- Cell components passed via `(component CellName)` hash don't match `ComponentLike` expected type
- Likely needs `ComponentLike<CellSignature>` or a cast

## Steps

1. Fix component signatures — add `Signature` interfaces to all components that receive args
2. Fix WorkflowWrapper `@title` — add to component Args if used, or remove from templates
3. Fix nullability — add optional chaining, non-null assertions, or type guards as appropriate
4. Fix index signature access — use bracket notation
5. Fix spread arguments — convert `...arguments` to explicit params
6. Fix ComponentLike — type the cell component hashes properly

## Acceptance Criteria

- [ ] `pnpm typecheck` returns 0 errors
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
