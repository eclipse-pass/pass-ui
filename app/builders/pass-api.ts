/**
 * Request builders for the PASS JSON:API backend (Elide).
 *
 * Produces RequestInfo objects compatible with store.request().
 * Handles our API conventions:
 *   - Model names are NOT pluralized (e.g., /data/grant, not /data/grants)
 *   - URL path segments are camelCase (e.g., /data/repositoryCopy)
 *   - Namespace is /data/ (configurable via ENV.passApi.namespace)
 *   - Elide RSQL filter syntax: filter[type]=rsqlExpression
 *   - Elide pagination: page[number], page[size], page[totals]
 *   - Elide sort: sort=+field,-field
 *   - JSON:API body types use camelCase (e.g., "submissionEvent")
 */
import ENV from 'pass-ui/config/environment';
import { recordIdentifierFor } from '@ember-data/store';

const NAMESPACE = ENV.passApi.namespace as string;
const JSON_API_CONTENT_TYPE = 'application/vnd.api+json';

/**
 * Convert a dasherized model name to a camelCase resource path/type.
 * e.g., 'repository-copy' → 'repositoryCopy'
 */
function resourcePathFor(type: string): string {
  return type.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
}

/**
 * Build the base URL for a model type.
 * e.g., 'repository-copy' → '/data/repositoryCopy'
 */
function baseURLFor(type: string): string {
  return `/${NAMESPACE}/${resourcePathFor(type)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;

/**
 * Serialize Elide-style query params to a URL search string.
 * Handles nested objects: filter[type]=value, page[number]=1, etc.
 */
function serializeQueryParams(params: QueryParams): string {
  const parts: string[] = [];

  for (const key of Object.keys(params).sort((a, b) => a.localeCompare(b))) {
    const value = params[key];
    if (value == null) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object → bracket notation: filter[submission]=..., page[number]=1
      for (const subKey of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
        const subValue = value[subKey];
        if (subValue == null) continue;
        parts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(String(subValue))}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.join('&');
}

/**
 * Build a query request for a collection of resources.
 *
 * Usage:
 *   const { content } = await store.request(query('submission', {
 *     filter: { submission: 'submissionStatus=out=cancelled' },
 *     include: 'publication,grants.primaryFunder',
 *     page: { number: 1, size: 10, totals: true },
 *   }));
 */
export function query(type: string, params: QueryParams = {}) {
  const url = baseURLFor(type);
  const queryString = serializeQueryParams(params);
  const headers = new Headers();
  headers.append('Accept', JSON_API_CONTENT_TYPE);

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'query' as const,
    // Always reload for queries to match legacy adapter behavior.
    // Without this, the CacheHandler serves stale cached results when
    // revisiting a page after creating/updating records via legacy .save().
    cacheOptions: { types: [type], reload: true },
  };
}

/**
 * Build a findRecord request for a single resource by ID.
 *
 * Usage:
 *   const { content } = await store.request(findRecord('grant', '1', {
 *     include: 'pi,coPis,primaryFunder',
 *   }));
 */
export function findRecord(type: string, id: string, options: QueryParams = {}) {
  const url = `${baseURLFor(type)}/${encodeURIComponent(id)}`;
  const queryString = serializeQueryParams(options);
  const headers = new Headers();
  headers.append('Accept', JSON_API_CONTENT_TYPE);

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'findRecord' as const,
    cacheOptions: { types: [type] },
  };
}

// -- Mutation builders --

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface StoreWithSchema {
  schema: {
    fields(identifier: { type: string }): Map<string, { kind: string; type?: string }>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAttribute(record: any, key: string, attributes: Record<string, unknown>): void {
  const value = record[key];
  if (value !== undefined) {
    attributes[key] = value instanceof Date ? value.toISOString() : value;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBelongsTo(record: any, key: string, relationships: Record<string, unknown>): void {
  const related = record[key];
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeHasMany(record: any, key: string, relationships: Record<string, unknown>): void {
  const related = record[key];
  if (related !== undefined && related !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relData = (Array.isArray(related) ? related : Array.from(related as Iterable<any>)).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => {
        const relIdentifier = recordIdentifierFor(r);
        return { type: resourcePathFor(relIdentifier.type), id: relIdentifier.id };
      },
    );
    relationships[key] = { data: relData };
  }
}

/**
 * Serialize an Ember Data record to a JSON:API resource document.
 * Uses store.schema.fields() to enumerate attributes and relationships,
 * reads current values directly from the record.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeRecord(record: any, store: StoreWithSchema): { data: Record<string, unknown> } {
  const identifier = recordIdentifierFor(record);
  const apiType = resourcePathFor(identifier.type);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = { type: apiType };

  // Include id for updates; omit for creates (new records have no id yet)
  if (identifier.id) {
    data.id = identifier.id;
  }

  const fields = store.schema.fields({ type: identifier.type });
  const attributes: Record<string, unknown> = {};
  const relationships: Record<string, unknown> = {};

  fields.forEach((field, key) => {
    if (field.kind === 'attribute') {
      serializeAttribute(record, key, attributes);
    } else if (field.kind === 'belongsTo') {
      serializeBelongsTo(record, key, relationships);
    } else if (field.kind === 'hasMany') {
      serializeHasMany(record, key, relationships);
    }
  });

  if (Object.keys(attributes).length > 0) {
    data.attributes = attributes;
  }
  if (Object.keys(relationships).length > 0) {
    data.relationships = relationships;
  }

  return { data };
}

/**
 * Build a saveRecord request (POST for new, PATCH for existing).
 *
 * Usage:
 *   await store.request(saveRecord(record, store));
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveRecord(record: any, store: StoreWithSchema) {
  const identifier = recordIdentifierFor(record);
  const isNew = !identifier.id;
  const url = isNew
    ? baseURLFor(identifier.type)
    : `${baseURLFor(identifier.type)}/${encodeURIComponent(identifier.id!)}`;

  const headers = new Headers();
  headers.append('Accept', JSON_API_CONTENT_TYPE);
  headers.append('Content-Type', JSON_API_CONTENT_TYPE);

  const body = JSON.stringify(serializeRecord(record, store));

  return {
    url,
    method: isNew ? 'POST' : 'PATCH',
    headers,
    body,
    op: isNew ? ('createRecord' as const) : ('updateRecord' as const),
    records: [identifier],
    cacheOptions: { types: [identifier.type] },
  };
}

/**
 * Build a deleteRecord request.
 *
 * Usage:
 *   await store.request(deleteRecord(record));
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteRecord(record: any) {
  const identifier = recordIdentifierFor(record);
  const url = `${baseURLFor(identifier.type)}/${encodeURIComponent(identifier.id!)}`;

  const headers = new Headers();
  headers.append('Accept', JSON_API_CONTENT_TYPE);

  return {
    url,
    method: 'DELETE',
    headers,
    op: 'deleteRecord' as const,
    records: [identifier],
    cacheOptions: { types: [identifier.type] },
  };
}
