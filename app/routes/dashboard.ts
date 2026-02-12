import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model(): Promise<{ numberAwaitingApproval: number; numberAwaitingEdits: number }> {
    const userId = this.currentUser.user?.id;

    const awaitingApproval = await this.store.query('submission', {
      filter: { submission: `submitter.id==${userId};submissionStatus==approval-requested` },
    });

    const awaitingChanges = await this.store.query('submission', {
      filter: { submission: `preparers.id==${userId};submissionStatus==changes-requested` },
    });

    return {
      numberAwaitingApproval: awaitingApproval.length,
      numberAwaitingEdits: awaitingChanges.length,
    };
  }
}
