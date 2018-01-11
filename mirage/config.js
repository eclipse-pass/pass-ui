import ENV from 'pass-ember/config/environment';

// For the moment pass through all requests to a presumably running Fedora
export default function() {
  this.urlPrefix = `${ENV.api.host}/${ENV.api.namespace}`
  this.passthrough();
}
