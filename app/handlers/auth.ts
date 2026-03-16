import type { NextFn, RequestContext } from '@ember-data/request';
import { service } from '@ember/service';
import type SessionService from 'ember-simple-auth/services/session';

/**
 * Request handler that checks responses for 401/403 status codes
 * and invalidates the ember-simple-auth session when detected.
 *
 * This replaces the equivalent logic in the legacy ApplicationAdapter's
 * `ensureResponseAuthorized` method.
 *
 * This is an Ember-aware handler (uses @service injection) — it must
 * have its owner set via setOwner() before being registered with the
 * RequestManager.
 */
export default class AuthHandler {
  @service declare session: SessionService;

  async request<T>(context: RequestContext, next: NextFn<T>) {
    try {
      const result = await next(context.request);

      // Check successful responses too (adapter did this for all responses)
      if (result.response && [401, 403].includes(result.response.status) && this.session.isAuthenticated) {
        await this.session.invalidate();
      }

      return result;
    } catch (error: unknown) {
      // Handle error responses (non-ok status codes throw from Fetch handler)
      const err = error as { response?: Response };
      if (err.response && [401, 403].includes(err.response.status) && this.session.isAuthenticated) {
        await this.session.invalidate();
      }
      throw error;
    }
  }
}
