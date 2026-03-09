import type { Handler, NextFn, RequestContext } from '@ember-data/request';
import { singularize } from '@warp-drive/utilities/string';

/**
 * Dasherize a camelCase or PascalCase string.
 * e.g., 'submissionEvent' → 'submission-event'
 */
function dasherize(str: string): string {
  return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Recursively dasherize all `type` fields in a JSON:API document.
 * This normalizes camelCase API types (e.g., "submissionEvent") to
 * dasherized model names (e.g., "submission-event") that match
 * Ember Data's schema registry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTypes(obj: any): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      normalizeTypes(item);
    }
    return;
  }

  // Normalize the type field on resource objects:
  // singularize + dasherize, matching the old serializer's modelNameFromPayloadKey
  if (typeof obj.type === 'string') {
    obj.type = singularize(dasherize(obj.type));
  }

  // Recurse into data (single resource or array)
  if (obj.data !== undefined) {
    normalizeTypes(obj.data);
  }

  // Recurse into included
  if (Array.isArray(obj.included)) {
    normalizeTypes(obj.included);
  }

  // Recurse into relationships
  if (obj.relationships && typeof obj.relationships === 'object') {
    for (const rel of Object.values(obj.relationships)) {
      normalizeTypes(rel);
    }
  }
}

/**
 * Request handler that normalizes JSON:API response types from camelCase
 * to dasherized format. This replaces the serializer's modelNameFromPayloadKey
 * function and ensures API response types match Ember Data's schema registry.
 *
 * Must be placed AFTER Fetch in the handler chain (it processes responses,
 * not requests).
 */
const JsonApiNormalizeHandler: Handler = {
  async request<T>(context: RequestContext, next: NextFn<T>) {
    // next() returns a StructuredDocument: { content: <JSON:API doc>, response, request }
    // We need to normalize types on the inner .content, not the wrapper.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = (await next(context.request)) as any;
    const content = doc?.content;

    if (content && typeof content === 'object') {
      normalizeTypes(content);
    }

    return doc;
  },
};

export default JsonApiNormalizeHandler;
