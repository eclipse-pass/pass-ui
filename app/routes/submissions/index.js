/* eslint-disable ember/no-get */
import { inject as service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
import { get } from '@ember/object';
import QueryBuilder from '../../util/query-builder';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;

  async model() {
    const user = get(this, 'currentUser.user');

    let filter = new QueryBuilder();

    if (user.get('isAdmin')) {
      filter.notEq('submission', 'submissionStatus', 'CANCELLED');
    } else if (user.get('isSubmitter')) {
      filter.eq('submission', 'submitter.id', user.get('id')).noEq('submission', 'submissionStatus', 'CANCELLED');
    }

    filter = filter.build();

    // TODO: do we need to do anything to limit or not-limit results set size?
    const submissions = this.store.query('submission', filter);

    return RSVP.hash({
      submissions,
    });
  }
}
