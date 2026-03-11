import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import JSONAPICache from '@ember-data/json-api';
import { buildSchema, instantiateRecord, modelFor, teardownRecord } from '@ember-data/model';
import type Model from '@ember-data/model';
import { getOwner, setOwner } from '@ember/owner';
import XSRFHandler from 'pass-ui/handlers/xsrf';
import AuthHandler from 'pass-ui/handlers/auth';
import JsonApiNormalizeHandler from 'pass-ui/handlers/json-api-normalize';
import { saveRecord as buildSaveRequest, deleteRecord as buildDeleteRequest } from 'pass-ui/builders/pass-api';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createSchemaService(): any {
    return buildSchema(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCache(capabilities: any) {
    return new JSONAPICache(capabilities);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instantiateRecord(key: any, createRecordArgs: Record<string, unknown>) {
    return instantiateRecord.call(this, key, createRecordArgs);
  }

  teardownRecord(record: unknown): void {
    return teardownRecord.call(this, record as Model);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelFor(type: string): any {
    return modelFor.call(this, type) || super.modelFor(type);
  }

  // -- Convenience methods --

  /**
   * Persist a record to the server (POST for new, PATCH for existing).
   * Wraps the saveRecord builder for easy mocking in tests.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async persistRecord(record: any): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request(buildSaveRequest(record, this) as any);
  }

  /**
   * Delete a record from the server (sends DELETE request).
   * Named differently from Store.deleteRecord() which only unloads from cache.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async destroyRecord(record: any): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request(buildDeleteRequest(record) as any);
  }
}
