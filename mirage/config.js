import ENV from 'pass-ember/config/environment';

// TODO Disable mirage entirely?

// Bypass mirage
export default function() {
  this.urlPrefix = `${ENV.fedora.base}`
  this.passthrough();
}
