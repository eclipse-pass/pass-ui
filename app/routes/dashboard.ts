import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import { query } from 'pass-ui/builders/pass-api';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionModel from 'pass-ui/models/submission';
import type { JsonApiDocument } from 'pass-ui/types/json-api';
import type AppStore from 'pass-ui/services/store';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  @service declare store: AppStore;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model(): Promise<{ numberAwaitingApproval: number; numberAwaitingEdits: number }> {
    const userId = this.currentUser.user?.id;

    const { content: approvalContent }: JsonApiDocument<SubmissionModel[]> = await this.store.request(
      query('submission', {
        filter: { submission: `submitter.id==${userId};submissionStatus==approval-requested` },
      }),
    );

    const { content: changesContent }: JsonApiDocument<SubmissionModel[]> = await this.store.request(
      query('submission', {
        filter: { submission: `preparers.id==${userId};submissionStatus==changes-requested` },
      }),
    );

    return {
      numberAwaitingApproval: approvalContent.data.length,
      numberAwaitingEdits: changesContent.data.length,
    };
  }
}
