import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';

export default class ThanksRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(params: { submission: string }): Promise<{ submission: any }> {
    return {
      submission: await this.store.findRecord('submission', params.submission, { include: 'repositories' }),
    };
  }
}
