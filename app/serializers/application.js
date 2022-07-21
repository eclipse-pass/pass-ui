import ENV from 'pass-ui/config/environment';
import FedoraJsonLdSerializer from './fedora-jsonld';

export default class Application extends FedoraJsonLdSerializer {
  contextURI = ENV.fedora.context;
  dataURI = ENV.fedora.data;
}
// import DS from 'ember-data';

// export default DS.JSONAPISerializer.extend({});
