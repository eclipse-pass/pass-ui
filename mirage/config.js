import ENV from 'pass-ember/config/environment';

// Bypass mirage
export default function() {
  this.urlPrefix = `${ENV.fedora.base}`
  this.passthrough();
}
