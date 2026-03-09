// eslint-disable-next-line ember/use-ember-data-rfc-395-imports -- ember-data/store includes model + legacy compat setup
import Store from 'ember-data/store';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import { CacheHandler } from '@ember-data/store';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import { getOwner, setOwner } from '@ember/owner';
import XSRFHandler from 'pass-ui/handlers/xsrf';
import AuthHandler from 'pass-ui/handlers/auth';
import JsonApiNormalizeHandler from 'pass-ui/handlers/json-api-normalize';

/**
 * Custom store that extends ember-data's default store with our
 * request handler chain:
 *
 *   XSRFHandler → AuthHandler → LegacyNetworkHandler → Fetch
 *
 * - XSRFHandler: reads XSRF-TOKEN cookie, adds X-XSRF-TOKEN header
 * - AuthHandler: invalidates session on 401/403 responses
 * - LegacyNetworkHandler: bridges to existing adapters/serializers
 *   (for store.query(), store.findRecord(), etc.)
 * - Fetch: native fetch for store.request() calls
 *
 * Legacy store.query()/findRecord()/etc. calls flow through
 * LegacyNetworkHandler → adapter/serializer (unchanged behavior).
 * New store.request(builder()) calls flow through all handlers.
 */
export default class AppStore extends Store {
  constructor(...args: unknown[]) {
    super(...args);

    const owner = getOwner(this)!;
    const authHandler = new AuthHandler();
    setOwner(authHandler, owner);

    this.requestManager = new RequestManager()
      .use([XSRFHandler, authHandler, LegacyNetworkHandler, JsonApiNormalizeHandler, Fetch])
      .useCache(CacheHandler);
  }
}
