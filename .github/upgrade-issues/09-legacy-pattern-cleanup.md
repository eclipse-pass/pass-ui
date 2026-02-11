---
title: "Remove legacy patterns (@alias, @computed, get/set, @observes)"
labels: ["upgrade", "modernize", "sprint-3"]
depends_on: [8]
---

## Summary

Remove all classic Ember reactivity patterns from app code. These patterns depend on `@ember/object/computed`, `@ember/object` get/set, and `@ember-decorators/object` — all of which are deprecated and targeted for removal. While not all have a hard "until: 7.0" tag yet, they block TypeScript (return types are `any`), prevent proper autotracking, and `@observes` in particular depends on the Ember global barrel imports that ARE removed in 7.0.

## Blocked By

- #8 — Typecheck errors (need reliable type checking before refactoring)

## Inventory

| Pattern | Count | Files | 7.0 Blocker? |
|---|---|---|---|
| `@observes` | 2 | 1 (`search-associated.js`) | **Yes** (deps on Ember global) |
| `@alias` | 25 | 7 controllers | Not yet, blocks TS |
| `@computed` | 14 | 5 files | Not yet, blocks TS |
| `get()`/`set()` | 114 | 16 files | Not yet, blocks TS |
| `Transform.extend()` | 1 | 1 (`transforms/set.js`) | Not yet |

## PRs

### PR A: @alias → native getters (25 in 7 controllers)

All in submission workflow controllers (`app/controllers/submissions/new/*.ts`).

**Pattern**:
```typescript
// Before
@alias('model.newSubmission') submission!: SubmissionModel;

// After
get submission(): SubmissionModel { return this.model.newSubmission; }
```

**Files**:
- `app/controllers/submissions/new/basics.ts` (4)
- `app/controllers/submissions/new/grants.ts` (3)
- `app/controllers/submissions/new/policies.ts` (4)
- `app/controllers/submissions/new/repositories.ts` (4)
- `app/controllers/submissions/new/metadata.ts` (4)
- `app/controllers/submissions/new/files.ts` (3)
- `app/controllers/submissions/new/review.ts` (3)

**Notes**: All aliases are read-only (no two-way binding needed). Remove `import { alias } from '@ember/object/computed'` from each file.

### PR B: @computed → @tracked + native getters (14 in 5 files)

**Pattern**:
```typescript
// Before
@computed('publication.title')
get titleIsInvalid(): boolean {
  return !get(this, 'publication.title');
}

// After
get titleIsInvalid(): boolean {
  return !this.publication?.title;
}
```

**Files**:
- `app/components/policy-card/index.gts` (4 — includes getter/setter pairs for workflow service)
- `app/controllers/submissions/detail.ts` (2)
- `app/controllers/submissions/new/files.ts` (2)
- `app/controllers/submissions/new/basics.ts` (4)
- `app/controllers/submissions/new/review.ts` (2)

**Notes**: For policy-card getter/setter pairs, the workflow service properties are already `@tracked`, so native getters auto-invalidate.

### PR C: get()/set() → direct property access (114 in 16 files)

Largest single cleanup. Do file-by-file, testing after each.

**Pattern categories**:
1. `get(this, 'prop')` → `this.prop`
2. `get(this, 'deep.path')` → `this.deep?.path`
3. `set(this, 'prop', val)` → `this.prop = val` (ensure `@tracked`)
4. `set(obj, 'prop', val)` on Ember Data models → `obj.prop = val`
5. `this.set('prop', val)` → `this.prop = val`

**High-count files** (do first):
- `app/controllers/submissions/detail.ts` (29)
- `app/controllers/submissions/new/basics.ts` (19)
- `app/services/submission-handler.ts` (6)
- `app/services/workflow.ts` (6)
- `app/controllers/submissions/new.ts` (6)

**Also clean up**: `setProperties()` calls (3 in 2 files).

### PR D: @observes rewrite + Transform.extend() modernization

**search-associated.js** — Full rewrite. Uses `@observes` from `@ember-decorators/object` to watch `associatedId`, triggers store query, then observes `content` to call `recompute()`. Replace with a Glimmer component or ember-concurrency task pattern.

**transforms/set.js** — Convert from `Transform.extend()` to native class:
```typescript
export default class SetTransform extends Transform {
  deserialize(serialized: unknown): unknown[] | undefined {
    if (Array.isArray(serialized)) return serialized;
    return undefined;
  }
  serialize(deserialized: unknown): unknown[] | undefined {
    if (Array.isArray(deserialized)) return deserialized;
    return undefined;
  }
}
```

## Acceptance Criteria

- [ ] Zero `@alias` imports from `@ember/object/computed`
- [ ] Zero `@computed` imports from `@ember/object`
- [ ] Zero `get()`/`set()` imports from `@ember/object` in app code
- [ ] Zero `@observes` / `@ember-decorators/object` usage
- [ ] Zero `Transform.extend()` (classic class syntax)
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
