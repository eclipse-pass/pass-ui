import Store, { CacheHandler } from '@ember-data/store';
import type { CacheCapabilitiesManager, SchemaService } from '@ember-data/store/types';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import JSONAPICache from '@ember-data/json-api';
import { buildSchema, instantiateRecord, modelFor, teardownRecord } from '@ember-data/model';
import type Model from '@ember-data/model';
import { getOwner, setOwner } from '@ember/owner';
import XSRFHandler from 'pass-ui/handlers/xsrf';
import AuthHandler from 'pass-ui/handlers/auth';
import JsonApiNormalizeHandler from 'pass-ui/handlers/json-api-normalize';
import {
  saveRecord as buildSaveRequest,
  deleteRecord as buildDeleteRequest,
  type StoreWithSchema,
} from 'pass-ui/builders/pass-api';

/**
 * Custom WarpDrive store using the modern (non-legacy) configuration.
 *
 * Extends @ember-data/store directly with explicit model hooks from
 * @ember-data/model (buildSchema, instantiateRecord, teardownRecord, modelFor).
 * No legacy adapter/serializer bridge — all network requests go through
 * the request handler chain:
 *
 *   XSRFHandler → AuthHandler → JsonApiNormalizeHandler → Fetch
 *
 * - XSRFHandler: reads XSRF-TOKEN cookie, adds X-XSRF-TOKEN header
 * - AuthHandler: invalidates session on 401/403 responses
 * - JsonApiNormalizeHandler: dasherizes type names in JSON:API responses
 * - Fetch: native fetch handler
 */
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

  // -- Model (Ember Only) hooks --

  createSchemaService(): SchemaService {
    return buildSchema(this as unknown as Store);
  }

  createCache(capabilities: CacheCapabilitiesManager) {
    return new JSONAPICache(capabilities);
  }

  instantiateRecord(key: { type: string; id: string | null; lid: string }, createRecordArgs: Record<string, unknown>) {
    return instantiateRecord.call(this as unknown as Store, key, createRecordArgs);
  }

  teardownRecord(record: unknown): void {
    return teardownRecord.call(this, record as Model);
  }

  override modelFor(type: string) {
    return (modelFor.call(this, type) || super.modelFor(type)) as ReturnType<Store['modelFor']>;
  }

  // -- Convenience methods --

  /**
   * Persist a record to the server (POST for new, PATCH for existing).
   * Wraps the saveRecord builder for easy mocking in tests.
   */
  async persistRecord(record: Model) {
    return this.request(
      buildSaveRequest(record, this as unknown as StoreWithSchema) as Parameters<Store['request']>[0],
    );
  }

  /**
   * Delete a record from the server (sends DELETE request).
   * Named differently from Store.deleteRecord() which only unloads from cache.
   */
  async destroyRecord(record: Model) {
    return this.request(buildDeleteRequest(record) as Parameters<Store['request']>[0]);
  }
}
