/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model() {
    const userId = get(this, 'currentUser.user.id');

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
