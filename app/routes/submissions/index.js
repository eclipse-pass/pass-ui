/* eslint-disable ember/no-get */
import { inject as service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
import { get } from '@ember/object';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;

  async model() {
    const user = get(this, 'currentUser.user');

    let query;

    if (user.get('isAdmin')) {
      query = {
        filter: { submission: 'submissionStatus=out=CANCELLED' },
      };
    } else if (user.get('isSubmitter')) {
      query = {
        filter: { submission: `submitter.id==${user.get('id')};submissionStatus=out=CANCELLED` },
        sort: '-submittedDate',
      };
    }

    // TODO: do we need to do anything to limit or not-limit results set size?
    const submissions = this.store.query('submission', query);

    return RSVP.hash({
      submissions,
    });
  }
}
