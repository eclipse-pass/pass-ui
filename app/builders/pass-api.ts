/**
 * Request builders for the PASS JSON:API backend.
 *
 * These wrap WarpDrive's built-in JSON:API builders to handle our API
 * conventions:
 *   - Model names are NOT pluralized (e.g., /data/grant, not /data/grants)
 *   - URL path segments are camelCase (e.g., /data/repositoryCopy)
 *   - Namespace is /data/ (configurable via ENV.passApi.namespace)
 */
import {
  query as jsonApiQuery,
  findRecord as jsonApiFindRecord,
  deleteRecord as jsonApiDeleteRecord,
  createRecord as jsonApiCreateRecord,
  updateRecord as jsonApiUpdateRecord,
  setBuildURLConfig,
} from '@warp-drive/utilities/json-api';
import ENV from 'pass-ui/config/environment';

// Configure the base URL for all builders
setBuildURLConfig({
  host: '',
  namespace: ENV.passApi.namespace as string,
});

/**
 * Convert a dasherized model name to a camelCase resource path.
 * e.g., 'repository-copy' → 'repositoryCopy'
 */
function resourcePathFor(type: string): string {
  return type.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;

interface BuilderOptions {
  resourcePath?: string;
  [key: string]: unknown;
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
export function query(type: string, params: QueryParams = {}, options: BuilderOptions = {}) {
  return jsonApiQuery(type, params, {
    resourcePath: resourcePathFor(type),
    ...options,
  });
}

/**
 * Build a findRecord request for a single resource by ID.
 *
 * Usage:
 *   const { content } = await store.request(findRecord('grant', '1', {
 *     include: 'pi,coPis,primaryFunder',
 *   }));
 */
export function findRecord(type: string, id: string, options: BuilderOptions = {}) {
  return jsonApiFindRecord(type, id, {
    resourcePath: resourcePathFor(type),
    ...options,
  });
}

/**
 * Build a deleteRecord request for an existing resource.
 *
 * Usage:
 *   const { content } = await store.request(deleteRecord(record));
 */
export function deleteRecord(record: unknown, options: BuilderOptions = {}) {
  return jsonApiDeleteRecord(record, options);
}

/**
 * Build a createRecord request for a new resource.
 *
 * Usage:
 *   const { content } = await store.request(createRecord(record));
 */
export function createRecord(record: unknown, options: BuilderOptions = {}) {
  return jsonApiCreateRecord(record, options);
}

/**
 * Build an updateRecord request for an existing resource.
 *
 * Usage:
 *   const { content } = await store.request(updateRecord(record));
 */
export function updateRecord(record: unknown, options: BuilderOptions = {}) {
  return jsonApiUpdateRecord(record, options);
}
