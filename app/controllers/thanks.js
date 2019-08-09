import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  queryParams: ['submission'],
  submission: null,

  configurator: service('app-static-config'),

  assetsUri: null,

  init() {
    this._super(...arguments);
    this.get('configurator').getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  }
});
