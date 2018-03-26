import ENV from 'pass-ember/config/environment';
import FedoraJsonLdAdapter from './fedora-jsonld';

export default FedoraJsonLdAdapter.extend({
    baseURI: ENV.fedora.base,
    username: ENV.fedora.username,
    password: ENV.fedora.password
});
