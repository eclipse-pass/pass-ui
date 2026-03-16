import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import { findRecord } from 'pass-ui/builders/pass-api';
import type SubmissionModel from 'pass-ui/models/submission';
import type { JsonApiDocument } from 'pass-ui/types/json-api';
import type AppStore from 'pass-ui/services/store';

interface ThanksModel {
  submission: SubmissionModel;
}

export default class ThanksRoute extends CheckSessionRoute {
  @service declare store: AppStore;

  async model(params: { submission: string }): Promise<ThanksModel> {
    const { content }: JsonApiDocument<SubmissionModel> = await this.store.request(
      findRecord('submission', params.submission, { include: 'repositories' }),
    );
    return { submission: content.data };
  }
}
