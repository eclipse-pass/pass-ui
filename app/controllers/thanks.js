/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThanksController extends Controller {
  queryParams = ['submission'];

  @service('app-static-config') staticConfig;

  @tracked submission = null;
  @tracked userGuideUrl = null;

  constructor() {
    super(...arguments);

    this.userGuideUrl = this.staticConfig.config?.branding?.pages?.userGuideUrl;
  }
}
