import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import { query } from 'pass-ui/builders/pass-api';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model(): Promise<{ numberAwaitingApproval: number; numberAwaitingEdits: number }> {
    const userId = this.currentUser.user?.id;

    const { content: approvalContent } = await this.store.request(
      query('submission', {
        filter: { submission: `submitter.id==${userId};submissionStatus==approval-requested` },
      }),
    );

    const { content: changesContent } = await this.store.request(
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
