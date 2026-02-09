/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThanksController extends Controller {
  queryParams = ['submission'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('app-static-config') declare staticConfig: any;

  @tracked submission: string | null = null;
  @tracked userGuideUrl: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.userGuideUrl = this.staticConfig.config?.branding?.pages?.instructionsUrl;
  }
}
