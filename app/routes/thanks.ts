import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import { findRecord } from '@ember-data/legacy-compat/builders';
import type SubmissionModel from 'pass-ui/models/submission';

interface ThanksModel {
  submission: SubmissionModel;
}

export default class ThanksRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  async model(params: { submission: string }): Promise<ThanksModel> {
    const { content: submission } = await this.store.request(
      findRecord('submission', params.submission, { include: 'repositories' }),
    );
    return { submission };
  }
}
