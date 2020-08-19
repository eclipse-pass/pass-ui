import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThanksController extends Controller {
  queryParams = ['submission'];

  @service('app-static-config')
  configurator;

  @tracked submission = null;
  @tracked assetsUri = null;

  constructor() {
    super(...arguments);
    this.configurator.getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  }
}
