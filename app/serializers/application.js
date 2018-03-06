import ENV from 'pass-ember/config/environment';
import FedoraJsonLdSerializer from './fedora-jsonld';

export default FedoraJsonLdSerializer.extend({
  contextURI: ENV.fedora.context,
  username: ENV.fedora.username,
  password: ENV.fedora.password
});
