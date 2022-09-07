/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import QueryBuilder from '../util/query-builder';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') currentUser;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model() {
    const userId = get(this, 'currentUser.user.id');
    const qb = new QueryBuilder('submission');

    const awaitingApproval = await this.store.query(
      'submission',
      qb.eq('submitter.id', userId).eq('submissionStatus', 'APPROVAL_REQUESTED').build()
    );

    qb.clear();

    const awaitingChanges = await this.store.query(
      'submission',
      qb.eq('preparers.id', userId).eq('submissionStatus', 'CHANGES_REQUESTED').build()
    );

    return {
      numberAwaitingApproval: awaitingApproval.length,
      numberAwaitingEdits: awaitingChanges.length,
    };
  }
}
