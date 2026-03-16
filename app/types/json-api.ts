/**
 * Shared JSON:API document types for WarpDrive store.request() responses.
 *
 * When calling `store.request(query(...))` or `store.request(findRecord(...))`,
 * the resolved value is a StructuredDocument whose `content` property holds
 * the deserialized JSON:API response body.
 */

/**
 * Pagination metadata returned by the Elide JSON:API backend.
 */
export interface PaginationMeta {
  page?: {
    totalRecords?: number;
    totalPages?: number;
    totalResults?: number;
    number?: number;
    size?: number;
  };
}

/**
 * A typed wrapper for the result of `store.request()`.
 *
 * Usage:
 *   const result: JsonApiDocument<SubmissionModel[]> = await store.request(query('submission', ...));
 *   const submissions = result.content.data;
 *   const meta = result.content.meta;
 *
 *   const result: JsonApiDocument<GrantModel> = await store.request(findRecord('grant', id));
 *   const grant = result.content.data;
 */
export interface JsonApiDocument<T> {
  content: {
    data: T;
    meta?: PaginationMeta;
  };
}
