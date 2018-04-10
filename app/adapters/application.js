import ENV from 'pass-ember/config/environment';
import FedoraJsonLdAdapter from './fedora-jsonld';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

// export default FedoraJsonLdAdapter.extend({
//     baseURI: ENV.fedora.base,
//     username: ENV.fedora.username,
//     password: ENV.fedora.password
// });

import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  host: 'http://localhost:8000',
  namespace: '',
  authorizer: 'authorizer:drf-token-authorizer',
});
