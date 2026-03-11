# WarpDrive Migration Guide

How we migrated PASS UI from legacy Ember Data adapters/serializers to WarpDrive's modern request handler architecture. This document uses real examples from our codebase so the team can understand the patterns and reasoning behind each change.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture: Before and After](#architecture-before-and-after)
3. [Phase 1: Request Handlers](#phase-1-request-handlers)
4. [Phase 2: Request Builders (Reads)](#phase-2-request-builders-reads)
5. [Phase 3: Request Builders (Writes)](#phase-3-request-builders-writes)
6. [Phase 4: Modern Store Configuration](#phase-4-modern-store-configuration)
7. [Phase 5: Delete Legacy Files](#phase-5-delete-legacy-files)
8. [What Stayed the Same](#what-stayed-the-same)
9. [Testing Changes](#testing-changes)
10. [Gotchas and Lessons Learned](#gotchas-and-lessons-learned)

---

## Overview

WarpDrive (the renamed Ember Data) provides two ways to make network requests:

1. **Legacy**: `store.query()`, `store.findRecord()`, `record.save()`, `store.deleteRecord()` — these go through adapters and serializers
2. **Modern**: `store.request(requestInfo)` — goes through a handler chain you configure explicitly

The legacy APIs (`query`, `findRecord`, `findAll`) are **deprecated** in WarpDrive. The modern `store.request()` API is the replacement. However, `store.createRecord()`, `store.peekAll()`, and `record.rollbackAttributes()` are **not deprecated** — they're cache-only operations that don't make network requests and remain part of the modern API.

The migration happened in phases so we could ship and test incrementally.

---

## Architecture: Before and After

### Before: Legacy adapter/serializer pipeline

```
store.query('submission', filter)
  → LegacyNetworkHandler
    → ApplicationAdapter (pathForType, headers, handleResponse)
      → fetch()
    → ApplicationSerializer (keyForAttribute, modelNameFromPayloadKey)
  → CacheHandler
  → returns records
```

Files involved:
- `app/adapters/application.ts` — XSRF headers, camelCase path mapping, 401/403 handling
- `app/serializers/application.ts` — camelCase ↔ dasherized type normalization
- `app/services/store.ts` — imported from `ember-data/store` (barrel that auto-wires legacy compat)

### After: Modern request handler chain

```
store.request(query('submission', filter))
  → XSRFHandler (adds XSRF-TOKEN header)
  → AuthHandler (invalidates session on 401/403)
  → JsonApiNormalizeHandler (dasherizes types in JSON:API responses)
  → Fetch (native fetch)
  → CacheHandler
  → returns StructuredDocument { content: { data, meta } }
```

Files involved:
- `app/handlers/xsrf.ts` — replaces adapter's `get headers()`
- `app/handlers/auth.ts` — replaces adapter's `handleResponse()`
- `app/handlers/json-api-normalize.ts` — replaces serializer's `modelNameFromPayloadKey()`
- `app/builders/pass-api.ts` — replaces adapter's URL building + serializer's `payloadKeyFromModelName()`
- `app/services/store.ts` — imports from `@ember-data/store` with explicit model hooks

No adapters. No serializers. No `LegacyNetworkHandler`.

---

## Phase 1: Request Handlers

Request handlers are objects with a `request<T>(context, next)` method. They form a chain — each handler can modify the request, call `next()`, and inspect/modify the response.

### XSRFHandler — replacing adapter headers

**Before** (in `app/adapters/application.ts`):
```ts
get headers() {
  return {
    'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)!['1'],
  };
}
```

**After** (`app/handlers/xsrf.ts`):
```ts
import type { Handler, NextFn, RequestContext } from '@ember-data/request';

const XSRFHandler: Handler = {
  async request<T>(context: RequestContext, next: NextFn<T>) {
    const headers = new Headers(context.request.headers);
    const match = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
    if (match?.[1]) {
      headers.set('X-XSRF-TOKEN', match[1]);
    }
    return next({ ...context.request, headers });
  },
};

export default XSRFHandler;
```

Key points:
- Spread the existing request, only override `headers`
- Call `next()` to pass to the next handler in the chain
- This is a plain object — no class, no Ember features needed

### AuthHandler — replacing adapter response handling

This one is more interesting because it needs access to Ember's `session` service. Handlers are normally plain objects, but you can use a class with `@service` injection if you call `setOwner()` on it during store construction.

**Before** (in `app/adapters/application.ts`):
```ts
async ensureResponseAuthorized(status, _headers, _payload, _requestData) {
  if ([401, 403].includes(status) && this.session.isAuthenticated) {
    await this.session.invalidate();
  }
}
```

**After** (`app/handlers/auth.ts`):
```ts
import type { NextFn, RequestContext } from '@ember-data/request';
import { service } from '@ember/service';

export default class AuthHandler {
  @service declare session: any;

  async request<T>(context: RequestContext, next: NextFn<T>) {
    try {
      const result = await next(context.request);
      if (result.response && [401, 403].includes(result.response.status)
          && this.session.isAuthenticated) {
        await this.session.invalidate();
      }
      return result;
    } catch (error: unknown) {
      const err = error as { response?: Response };
      if (err.response && [401, 403].includes(err.response.status)
          && this.session.isAuthenticated) {
        await this.session.invalidate();
      }
      throw error;
    }
  }
}
```

The `try/catch` is needed because the `Fetch` handler throws on non-ok status codes, so a 401 comes through as an exception, not a successful response.

### JsonApiNormalizeHandler — replacing serializer type normalization

Our API returns camelCase types (`submissionEvent`) but Ember Data's schema registry uses dasherized names (`submission-event`). The old serializer handled this in `modelNameFromPayloadKey`. Now we do it in a response handler.

**After** (`app/handlers/json-api-normalize.ts`):
```ts
import type { Handler, NextFn, RequestContext } from '@ember-data/request';
import { singularize } from '@warp-drive/utilities/string';

interface JsonApiNode {
  type?: string;
  data?: JsonApiNode | JsonApiNode[];
  included?: JsonApiNode[];
  relationships?: Record<string, JsonApiNode>;
  [key: string]: unknown;
}

function dasherize(str: string): string {
  return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
}

function normalizeTypes(obj: JsonApiNode | JsonApiNode[]): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) normalizeTypes(item);
    return;
  }
  if (typeof obj.type === 'string') {
    obj.type = singularize(dasherize(obj.type));
  }
  if (obj.data !== undefined) normalizeTypes(obj.data as JsonApiNode | JsonApiNode[]);
  if (Array.isArray(obj.included)) normalizeTypes(obj.included);
  if (obj.relationships && typeof obj.relationships === 'object') {
    for (const rel of Object.values(obj.relationships)) normalizeTypes(rel);
  }
}

const JsonApiNormalizeHandler: Handler = {
  async request<T>(context: RequestContext, next: NextFn<T>) {
    const doc = await next(context.request);
    const content = (doc as { content?: unknown }).content;
    if (content && typeof content === 'object') {
      normalizeTypes(content as JsonApiNode);
    }
    return doc;
  },
};
```

This recursively walks the JSON:API response and dasherizes + singularizes every `type` field. It handles `data`, `included`, and nested `relationships`.

### Wiring handlers in the store

**Before** — used `ember-data/store` barrel which auto-configures `LegacyNetworkHandler`:
```ts
import Store from 'ember-data/store';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';

export default class AppStore extends Store {
  constructor(...args: unknown[]) {
    super(...args);
    // ...
    this.requestManager = new RequestManager()
      .use([XSRFHandler, authHandler, LegacyNetworkHandler, JsonApiNormalizeHandler, Fetch])
      .useCache(CacheHandler);
  }
}
```

**After** — uses `@ember-data/store` directly, no legacy compat:
```ts
import Store, { CacheHandler } from '@ember-data/store';

export default class AppStore extends Store {
  constructor(...args: unknown[]) {
    super(...args);
    const owner = getOwner(this)!;
    const authHandler = new AuthHandler();
    setOwner(authHandler, owner);

    this.requestManager = new RequestManager()
      .use([XSRFHandler, authHandler, JsonApiNormalizeHandler, Fetch])
      .useCache(CacheHandler);
  }
}
```

Handler order matters: requests flow left-to-right through `use()`, responses flow right-to-left. So `JsonApiNormalizeHandler` processes the response *after* `Fetch` returns it but *before* the `CacheHandler` caches it.

---

## Phase 2: Request Builders (Reads)

Builders are functions that return a `RequestInfo` object — a plain object with `url`, `method`, `headers`, and WarpDrive-specific fields like `op` and `cacheOptions`.

### query builder

**Before** (legacy adapter call):
```ts
const grants = await this.store.query('grant', {
  filter: { grant: `pi.id==${userId}` },
  sort: '+awardStatus,-endDate',
  include: 'primaryFunder,directFunder',
  page: { number: 1, size: 10, totals: true },
});
```

**After** (builder + `store.request()`):
```ts
import { query } from 'pass-ui/builders/pass-api';

const { content: grantContent }: JsonApiDocument<GrantModel[]> = await this.store.request(
  query('grant', {
    filter: { grant: `pi.id==${userId}` },
    sort: '+awardStatus,-endDate',
    include: 'primaryFunder,directFunder',
    page: { number: 1, size: 10, totals: true },
  }),
);
const grants = grantContent.data;
const meta = grantContent.meta;
```

The key difference: `store.query()` returned records directly. `store.request()` returns a `StructuredDocument` with a `content` property containing the JSON:API document body. You destructure `content` to get `data` (the records) and `meta` (pagination info).

### findRecord builder

**Before**:
```ts
const grant = await this.store.findRecord('grant', params.grant, {
  include: 'primaryFunder,directFunder',
});
```

**After**:
```ts
import { findRecord } from 'pass-ui/builders/pass-api';

const { content }: JsonApiDocument<GrantModel> = await this.store.request(
  findRecord('grant', params.grant, { include: 'primaryFunder,directFunder' }),
);
const grant = content.data;
```

### The builder implementation

Our builders handle PASS-specific API conventions — camelCase URL paths, no pluralization, Elide RSQL filter syntax:

```ts
// app/builders/pass-api.ts

function resourcePathFor(type: string): string {
  // 'repository-copy' → 'repositoryCopy'
  return type.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function baseURLFor(type: string): string {
  // 'repository-copy' → '/data/repositoryCopy'
  return `/${NAMESPACE}/${resourcePathFor(type)}`;
}

export function query(type: string, params: QueryParams = {}) {
  const url = baseURLFor(type);
  const queryString = serializeQueryParams(params);
  const headers = new Headers();
  headers.append('Accept', 'application/vnd.api+json');

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'query' as const,
    cacheOptions: { types: [type], reload: true },
  };
}

export function findRecord(type: string, id: string, options: QueryParams = {}) {
  const url = `${baseURLFor(type)}/${encodeURIComponent(id)}`;
  const queryString = serializeQueryParams(options);
  const headers = new Headers();
  headers.append('Accept', 'application/vnd.api+json');

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'findRecord' as const,
    cacheOptions: { types: [type] },
  };
}
```

The `op` field tells WarpDrive what kind of operation this is (affects caching behavior). The `cacheOptions.types` field lets the cache know which types are affected. Setting `reload: true` on queries ensures fresh data on every request, matching our old adapter behavior.

### Shared response types

We defined shared TypeScript interfaces for typing `store.request()` results:

```ts
// app/types/json-api.ts

export interface PaginationMeta {
  page?: {
    totalRecords?: number;
    totalPages?: number;
    number?: number;
    size?: number;
  };
}

export interface JsonApiDocument<T> {
  content: {
    data: T;
    meta?: PaginationMeta;
  };
}
```

Usage:
```ts
const result: JsonApiDocument<SubmissionModel[]> = await store.request(query('submission', ...));
const submissions = result.content.data;   // SubmissionModel[]
const meta = result.content.meta;           // PaginationMeta | undefined
```

---

## Phase 3: Request Builders (Writes)

### record.save() → store.persistRecord()

**Before** — legacy `.save()`:
```ts
const publication = this.store.createRecord('publication', { doi, title, journal });
await publication.save();

const submission = this.store.createRecord('submission', { submissionStatus: 'draft' });
await submission.save();
```

**After** — `store.persistRecord()`:
```ts
const publication = this.store.createRecord('publication', { doi, title, journal });
await this.store.persistRecord(publication);

const submission = this.store.createRecord('submission', { submissionStatus: 'draft' });
await this.store.persistRecord(submission);
```

`store.createRecord()` is still used — it's a modern, non-deprecated API for creating records in the local cache. The change is how we persist them: instead of calling `.save()` on the record (which goes through the adapter), we call `store.persistRecord()` which uses our `saveRecord` builder.

### store.destroyRecord() → store.destroyRecord() (different implementation)

The method name is the same, but the implementation changed. The old `store.destroyRecord()` from the legacy barrel went through the adapter. Our new `AppStore.destroyRecord()` is a convenience method that uses the `deleteRecord` builder:

```ts
// app/services/store.ts
async destroyRecord(record: Model) {
  return this.request(buildDeleteRequest(record) as Parameters<Store['request']>[0]);
}
```

### The saveRecord builder — serialization without a serializer

The biggest piece of the write migration was building a serializer replacement. The `serializeRecord()` function in `app/builders/pass-api.ts` uses `store.schema.fields()` to enumerate a model's attributes and relationships at runtime, then builds a JSON:API document:

```ts
function serializeRecord(record: Model, store: StoreWithSchema) {
  const identifier = recordIdentifierFor(record);
  const apiType = resourcePathFor(identifier.type); // dasherized → camelCase

  const data: Record<string, unknown> = { type: apiType };
  if (identifier.id) data.id = identifier.id;

  const fields = store.schema.fields({ type: identifier.type });
  const attributes: Record<string, unknown> = {};
  const relationships: Record<string, unknown> = {};

  fields.forEach((field, key) => {
    // Skip client-only fields (e.g., _submissionEvents)
    if (key.startsWith('_')) return;

    if (field.kind === 'attribute') {
      serializeAttribute(record, key, attributes);
    } else if (field.kind === 'belongsTo') {
      serializeBelongsTo(record, key, relationships);
    } else if (field.kind === 'hasMany') {
      serializeHasMany(record, key, relationships);
    }
  });

  if (Object.keys(attributes).length > 0) data.attributes = attributes;
  if (Object.keys(relationships).length > 0) data.relationships = relationships;

  return { data };
}
```

Relationship serialization converts dasherized model types back to camelCase for the API:

```ts
function serializeBelongsTo(record: Model, key: string, relationships: Record<string, unknown>) {
  const related = (record as Record<string, unknown>)[key] as Model | null | undefined;
  if (related !== undefined) {
    if (related === null) {
      relationships[key] = { data: null };
    } else {
      const relIdentifier = recordIdentifierFor(related);
      relationships[key] = {
        data: { type: resourcePathFor(relIdentifier.type), id: relIdentifier.id },
      };
    }
  }
}
```

### Two-step file deletion

Files require a special two-step delete — first delete the file bytes from the file service, then delete the metadata record from the JSON:API backend. This replaces logic that was in a custom `FileAdapter`:

```ts
export async function deleteFileWithBytes(
  file: FileModel,
  store: { destroyRecord: (r: Model) => Promise<unknown> },
) {
  let uri: string = file.uri;
  if (!uri.startsWith('/')) uri = `/${uri}`;
  const token = document.cookie.match(/XSRF-TOKEN=([^;]*)/)![1]!;

  const response = await fetch(uri, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': token },
  });

  if (!response.ok) {
    throw new Error('Delete request to the file service failed');
  }

  await store.destroyRecord(file);
}
```

---

## Phase 4: Modern Store Configuration

The store import is the most subtle but important change.

**Before** — `ember-data/store` barrel:
```ts
import Store from 'ember-data/store';
```

This barrel import auto-configures: `buildSchema`, `instantiateRecord`, `teardownRecord`, `modelFor`, `JSONAPICache`, and wires up `LegacyNetworkHandler` for adapter/serializer support. It's convenient but couples you to the legacy pipeline.

**After** — `@ember-data/store` with explicit model hooks:
```ts
import Store, { CacheHandler } from '@ember-data/store';
import type { CacheCapabilitiesManager, SchemaService } from '@ember-data/store/types';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import JSONAPICache from '@ember-data/json-api';
import { buildSchema, instantiateRecord, modelFor, teardownRecord } from '@ember-data/model';
```

You must implement four hooks that the barrel used to wire up for you:

```ts
export default class AppStore extends Store {
  createSchemaService(): SchemaService {
    return buildSchema(this as unknown as Store);
  }

  createCache(capabilities: CacheCapabilitiesManager) {
    return new JSONAPICache(capabilities);
  }

  instantiateRecord(
    key: { type: string; id: string | null; lid: string },
    createRecordArgs: Record<string, unknown>,
  ) {
    return instantiateRecord.call(this as unknown as Store, key, createRecordArgs);
  }

  teardownRecord(record: unknown): void {
    return teardownRecord.call(this, record as Model);
  }

  override modelFor(type: string) {
    return (modelFor.call(this, type) || super.modelFor(type)) as ReturnType<Store['modelFor']>;
  }
}
```

The `as unknown as Store` casts are needed because TypeScript sees `AppStore` (which has extra methods like `persistRecord`) as incompatible with the base `Store` type parameter. These are safe casts — the functions only access base `Store` functionality.

---

## Phase 5: Delete Legacy Files

Once all reads use builders and all writes use `persistRecord`/`destroyRecord`, you can delete:

- `app/adapters/application.ts`
- `app/adapters/file.ts` (if you had a custom one)
- `app/serializers/application.ts`
- `tests/unit/adapters/application-test.ts`
- `tests/unit/serializers/application-test.ts`

And remove from `app/services/store.ts`:
- `import { LegacyNetworkHandler } from '@ember-data/legacy-compat'`
- `LegacyNetworkHandler` from the handler chain

---

## What Stayed the Same

These APIs are **not deprecated** and remain unchanged:

| API | Why it's still modern |
|---|---|
| `store.createRecord('type', attrs)` | Cache-only operation — creates a local record. No network request, no adapter needed. |
| `store.peekAll('type')` | Cache-only operation — returns all cached records of a type. No network request. |
| `record.rollbackAttributes()` | Cache-only operation — reverts local changes. No network request. |
| `@attr`, `@belongsTo`, `@hasMany` | Model decorators are unchanged. |

The pattern is: anything that touches the network was migrated to handlers/builders. Anything that only touches the local cache stayed the same.

---

## Testing Changes

### Mock stores in unit tests

The biggest test change: mock stores needed `persistRecord` instead of the old `save()` pattern.

**Before** — mocking `.save()` on the returned record:
```ts
service.store = {
  createRecord(type, values) {
    submissionEvent = { ...values };
    submissionEvent.save = () => {
      assert.ok(true);
      return Promise.resolve(this);
    };
    return submissionEvent;
  },
};
```

**After** — mocking `persistRecord` on the store:
```ts
service.store = {
  createRecord(type, values) {
    submissionEvent = { ...values };
    return submissionEvent;
  },
  persistRecord() {
    assert.ok(true);
    return Promise.resolve({ content: {} });
  },
};
```

### Stubbing fetch for deleteFileWithBytes

`deleteFileWithBytes()` uses native `fetch()` directly (not through the store), so Pretender/Mirage can't intercept it. You need to stub `globalThis.fetch`:

```ts
test('file deletion', async function (assert) {
  const originalCookie = document.cookie;
  document.cookie = 'XSRF-TOKEN=test-token';
  const fetchStub = Sinon.stub(globalThis, 'fetch')
    .resolves(new Response(null, { status: 200 }));

  try {
    // ... test logic using deleteFileWithBytes
  } finally {
    fetchStub.restore();
    document.cookie = `XSRF-TOKEN=; expires=${new Date(0).toUTCString()}`;
  }
});
```

### Typing store.request() results in tests

For integration/acceptance tests that use the real store, `store.request()` returns a `StructuredDocument`. Destructure the `content`:

```ts
const { content } = await store.request(query('grant', filter));
const grants = content.data; // GrantModel[]
```

---

## Gotchas and Lessons Learned

### 1. Handler order matters

```ts
.use([XSRFHandler, authHandler, JsonApiNormalizeHandler, Fetch])
```

Requests flow left → right: XSRF adds headers, Auth passes through, Normalize passes through, Fetch makes the HTTP call.

Responses flow right → left: Fetch returns the response, Normalize rewrites types, Auth checks for 401/403, XSRF passes through.

`JsonApiNormalizeHandler` **must** come after `Fetch` in the array — it processes responses, not requests. If placed before `Fetch`, it would try to normalize the request (which has no JSON:API body).

### 2. `ember-data/store` vs `@ember-data/store`

- `ember-data/store` — legacy barrel, auto-configures everything including `LegacyNetworkHandler`
- `@ember-data/store` — modern import, gives you just the base `Store` class

If you import from `ember-data/store`, you get legacy compat for free — but you also can't remove adapters/serializers because `LegacyNetworkHandler` will try to use them.

### 3. Client-only fields need to be skipped during serialization

Our `submission` model has `_submissionEvents` — a client-only `hasMany` relationship (prefixed with `_`). The old serializer didn't include it because the adapter never saw it. Our builder's `serializeRecord()` uses `store.schema.fields()` which returns ALL fields. We added a guard:

```ts
if (key.startsWith('_')) return;
```

Without this, the API returns a 500 because it doesn't know about `_submissionEvents`.

### 4. `reload: true` on query builders

Without `cacheOptions: { reload: true }`, the `CacheHandler` serves cached results for repeated queries. This caused stale data when navigating back to a list page after creating a record. The legacy adapter always hit the network for `query()` calls, so we replicate that with `reload: true`.

### 5. TypeScript compatibility with Store generics

`buildSchema(this)` and `instantiateRecord.call(this, ...)` fail TypeScript checks because `AppStore` (with its extra `persistRecord`/`destroyRecord` methods) isn't assignable to the base `Store` type parameter. The fix is `this as unknown as Store` — a safe cast since these functions only access base Store functionality.

### 6. Pretender doesn't intercept native fetch for test stubs

Mirage's Pretender v3 does intercept `fetch`, but `sinon.stub(globalThis, 'fetch')` overrides Pretender's interception. If you need to stub `fetch` in a test that also uses Mirage, be aware of this interaction. Our `deleteFileWithBytes` tests stub `globalThis.fetch` directly because the function makes a raw `fetch()` call outside the store's request pipeline.

### 7. Error handling in mock stores

When mocking `destroyRecord` to simulate failures:

```ts
// Wrong — causes unhandled rejection detection in tests
const storeDestroyFake = Sinon.fake.returns(Promise.reject());

// Correct — provide an Error value
const storeDestroyFake = Sinon.fake.rejects(new Error('destroy failed'));
```

`Promise.reject()` without a value triggers QUnit's global error handler for unhandled rejections, causing `global failure: undefined` errors.
