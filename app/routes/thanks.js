import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';

export default class ThanksRoute extends CheckSessionRoute {
  @service store;

  async model(params) {
    return {
      submission: await this.store.findRecord('submission', params.submission, { include: 'repositories' }),
    };
  }
}
