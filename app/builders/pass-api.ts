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
 */
import ENV from 'pass-ui/config/environment';

const NAMESPACE = ENV.passApi.namespace as string;
const JSON_API_ACCEPT = 'application/vnd.api+json';

/**
 * Convert a dasherized model name to a camelCase resource path.
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

  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value == null) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object → bracket notation: filter[submission]=..., page[number]=1
      for (const subKey of Object.keys(value).sort()) {
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
  headers.append('Accept', JSON_API_ACCEPT);

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'query' as const,
    cacheOptions: { types: [type] },
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
  headers.append('Accept', JSON_API_ACCEPT);

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    op: 'findRecord' as const,
    cacheOptions: { types: [type] },
  };
}
