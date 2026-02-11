---
title: "Migrate Ember Data to WarpDrive store.request() + schemas"
labels: ["upgrade", "ember-data", "warp-drive", "sprint-4"]
depends_on: [10]
---

## Summary

Migrate from the legacy `@ember-data/model` + adapter/serializer pattern to WarpDrive's `store.request()` + resource schemas. This is the most architecturally significant change. The `@warp-drive/legacy` bridge allows incremental migration — existing code continues working while new code adopts the new patterns.

**Note**: This is NOT required for Ember 7.0. The adapter/serializer pattern still works in WarpDrive 5.8. This migration is about future-proofing and aligning with the direction of the data layer.

## Blocked By

- #10 — V1 addon removal (clean dependency tree before data layer migration)

## Current Data Layer

### Adapters (2)
- `app/adapters/application.js` — JSON:API adapter with:
  - XSRF token injection (reads `XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header)
  - Session invalidation on 401/403 responses
  - Custom `pathForType()` — camelizes model names (e.g., `repository-copy` → `repositoryCopy`)
  - Namespace: `/data/` (configurable via `ENV.passApi.namespace`)
- `app/adapters/file.js` — Extends application adapter with:
  - Custom `deleteRecord()` — first deletes file bytes via direct fetch to file service URI, then deletes metadata via super

### Serializer (1)
- `app/serializers/application.js` — JSON:API serializer with:
  - `keyForAttribute()` — camelizes attribute names
  - `keyForRelationship()` — camelizes relationship keys
  - `payloadKeyFromModelName()` — singularizes and camelizes for payloads
  - `modelNameFromPayloadKey()` — dasherizes and singularizes back

### Models (13)
| Model | Attrs | Relationships | Special |
|---|---|---|---|
| `submission` | 9 attrs | 7 rels (submitter, publication, preparers, repositories, effectivePolicies, _submissionEvents, grants) | Central model, JSON metadata string |
| `publication` | 5 attrs | 1 rel (journal) | abstract getter/setter pair |
| `file` | 5 attrs | 1 rel (submission) | Custom delete adapter |
| `grant` | 7 attrs | 4 rels (pi, coPis, primaryFunder, directFunder) | — |
| `repository` | 8 attrs | 0 rels | `schemas` uses Set transform, `_selected` local state |
| `policy` | 4 attrs | 1 rel (repositories) | `_type` runtime attribute |
| `user` | 9 attrs | 0 rels | 3 attrs use Set transform (affiliation, locatorIds, roles) |
| `deposit` | 3 attrs | 3 rels | — |
| `funder` | 3 attrs | 1 rel (policy) | — |
| `submission-event` | 5 attrs | 2 rels | inverse relationship with submission |
| `repository-copy` | 3 attrs | 2 rels | externalIds uses Set transform |
| `journal` | 4 attrs | 0 rels | issns uses Set transform, pmcParticipation methods |
| `person` | 7 attrs | 0 rels | — |

### Custom Transform (1)
- `app/transforms/set.js` — Serializes/deserializes arrays (used by 6 model fields)

### Inflector Config
- `app/initializers/pass-api-inflector.js` — All 13 model names registered as uncountable (PASS API doesn't pluralize)

### Store Usage (25 files)
- `store.query()` — 15 files (Elide RSQL filters, pagination)
- `store.findRecord()` — 8 files (with include/sideloading)
- `store.createRecord()` — 3 files
- `record.save()` — 7 files
- `record.destroyRecord()` / `deleteRecord()` — 3 files
- `store.peekAll()` — 1 file

### Query Patterns
- **RSQL filters**: `submission.id==${id}`, `(prop=ini=*value*)`
- **Pagination**: `page: { number, size, totals }`
- **Include/sideloading**: `{ include: 'publication.journal,submitter' }`
- **Sort**: `{ sort: '+performedDate' }`
- **Query utilities**: `app/util/paginated-query.js`

## PRs

### PR A: Install WarpDrive packages + define resource schemas

1. Install `@warp-drive/ember`, `@warp-drive/core`, `@warp-drive/legacy`
2. Bump all `@ember-data/*` from 5.3.8 to 5.8.1 (lockstep)
3. Update `@ember-data-types/*` and `@warp-drive-types/*` dev dependencies
4. Configure WarpDrive with `setConfig()` in build config
5. Define `ResourceSchema` for all 13 models in `app/schemas/`:
   - Map `@attr` → field definitions
   - Map `@belongsTo`/`@hasMany` → relationship definitions
   - Map Set transform → array field type
6. Keep existing `@ember-data/model` via `@warp-drive/legacy` bridge

### PR B: Create request builders and handlers

Replace adapter/serializer logic with WarpDrive request infrastructure:

1. **XSRF Handler** — Middleware that reads `XSRF-TOKEN` cookie, adds `X-XSRF-TOKEN` header
2. **Auth Handler** — Middleware that checks 401/403 responses, invalidates session
3. **Namespace Config** — Sets API namespace (`/data/`)
4. **PathForType** — Converts dasherized model names to camelCase for URLs
5. **Serialization Handler** — CamelCase key transforms for request/response payloads
6. **File Delete Handler** — Two-step delete (bytes first, then metadata)

### PR C: Migrate store usage incrementally (25 files)

**Order** (lowest risk first):
1. Read-only queries in route model hooks (grants, submissions index/detail, dashboard)
2. Read-only queries in services (policies, doi, autocomplete, current-user)
3. Create/save operations in submission-handler
4. File adapter's custom delete
5. search-associated helper (if not already rewritten in issue #9)

**Pattern**:
```typescript
// Before
const results = await this.store.query('grant', grantQuery);

// After
import { query } from 'app/builders/grant';
const { content } = await this.store.request(query(grantQuery));
```

### PR D: Remove legacy adapter/serializer layer

Once all usage is migrated:
1. Delete `app/adapters/application.js` and `app/adapters/file.js`
2. Delete `app/serializers/application.js`
3. Delete `app/transforms/*.js` (all 5)
4. Delete `app/services/store.js` (deprecation-fix re-export)
5. Remove `@ember-data/adapter`, `@ember-data/serializer` from `package.json`
6. Remove `@warp-drive/legacy` bridge if no longer needed

## Risks and Mitigations

- **WarpDrive API stability**: Pin to specific version (5.8.1). The bridge pattern means existing code keeps working.
- **RSQL filter compatibility**: The query builder must produce the same RSQL filter strings. Write comparison tests.
- **File deletion**: The two-step delete is critical. Test extensively.
- **This phase can be deferred**: The app works on Ember 7.0 with adapters/serializers. WarpDrive migration is about future-proofing.

## Acceptance Criteria

- [ ] All 13 models have resource schemas
- [ ] Request builders handle XSRF, auth, namespace, camelCase, file delete
- [ ] Zero `store.query()`/`store.findRecord()` calls (all migrated to `store.request()`)
- [ ] `@ember-data/adapter` and `@ember-data/serializer` removed from dependencies
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
- [ ] Manual test of all CRUD operations (create submission, upload file, delete file, etc.)
