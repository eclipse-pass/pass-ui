import type { Handler, NextFn, RequestContext } from '@ember-data/request';

/**
 * Request handler that reads the XSRF-TOKEN from the document cookie
 * and attaches it as the X-XSRF-TOKEN header on every request.
 *
 * This replaces the equivalent logic in the legacy ApplicationAdapter's
 * `get headers()` accessor.
 */
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
