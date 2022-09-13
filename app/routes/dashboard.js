/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') currentUser;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model() {
    const userId = get(this, 'currentUser.user.id');

    const awaitingApproval = await this.store.query('submission', {
      filter: { submission: `submitter.id==${userId};submissionStatus==APPROVAL_REQUESTED` },
    });

    const awaitingChanges = await this.store.query('submission', {
      filter: { submission: `preparers.id==${userId};submissionStatus==CHANGES_REQUESTED` },
    });

    return {
      numberAwaitingApproval: awaitingApproval.length,
      numberAwaitingEdits: awaitingChanges.length,
    };
  }
}
