
import ENV from 'pass-ember/config/environment';
import FedoraJsonLdAdapter from './fedora-jsonld';

export default class Application extends FedoraJsonLdAdapter {
  baseURI = ENV.fedora.base;
  elasticsearchURI = ENV.fedora.elasticsearch;
  username = ENV.fedora.username;
  password = ENV.fedora.password;

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
  ensureResponseAuthorized(status /* ,headers, payload, requestData */) {
    if ([401, 403].includes(status) && this.session.isAuthenticated) {
      this.session.invalidate();
    }
  }
}
