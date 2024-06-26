import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { camelize } from '@ember/string';
import ENV from 'pass-ui/config/environment';
import { inject as service } from '@ember/service';

/**
 * PASS specific extensions for Ember Data's JSON:API adapter
 */
export default class ApplicationAdapter extends JSONAPIAdapter {
  @service session;

  namespace = ENV.passApi.namespace;

  get headers() {
    return {
      withCredentials: true,
      'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)['1'],
    };
  }

  // Camel case instead of pluralize model types for our API
  pathForType(type) {
    return camelize(type);
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
  handleResponse(status, headers, payload, requestData) {
    this.ensureResponseAuthorized(status, headers, payload, requestData);
    return super.handleResponse(...arguments);
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
  async ensureResponseAuthorized(status /* , headers, payload, requestData */) {
    if ([401, 403].includes(status) && this.session.isAuthenticated) {
      await this.session.invalidate();
    }
  }
}
