import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'pass-ui/config/environment';
import { service } from '@ember/service';

/**
 * PASS specific extensions for Ember Data's JSON:API adapter
 */
export default class ApplicationAdapter extends JSONAPIAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;

  namespace = ENV.passApi.namespace;

  // @ts-expect-error JSONAPIAdapter types headers as a property but Ember supports accessor override
  get headers() {
    return {
      'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]*)/)!['1'],
    };
  }

  // Camel case instead of pluralize model types for our API
  pathForType(type: string) {
    return type.replace(/[-_\s]+(.)?/g, (_: string, c: string) => (c ? c.toUpperCase() : ''));
  }

  /**
    This method is called for every response that the adapter receives from the
    API. If the response has a 401 or 403 status code it invalidates the session (see
    @method handleResponse
    @param {Number} status The response status as received from the API
    @param  {Object} headers HTTP headers as received from the API
    @param {Any} payload The response body as received from the API
    @param {Object} requestData the original request information
    @protected
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleResponse(status: number, headers: Record<string, string>, payload: any, requestData: any) {
    this.ensureResponseAuthorized(status, headers, payload, requestData);
    return super.handleResponse(status, headers, payload, requestData);
  }

  /**
    The default implementation for handleResponse.
    If the response has a 401 or 403 status code it invalidates the session.
    Override this method if you want custom invalidation logic for incoming responses.
    @method ensureResponseAuthorized
    @param {Number} status The response status as received from the API
    @param  {Object} headers HTTP headers as received from the API
    @param {Any} payload The response body as received from the API
    @param {Object} requestData the original request information
  */
  async ensureResponseAuthorized(
    status: number,
    _headers: Record<string, string>,
    _payload: unknown,
    _requestData: Record<string, unknown>,
  ) {
    if ([401, 403].includes(status) && this.session.isAuthenticated) {
      await this.session.invalidate();
    }
  }
}
