import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;
  @service store;

  async model() {
    const user = this.currentUser.user;

    let query;

    if (user.isAdmin) {
      query = {
        filter: { submission: 'submissionStatus=out=cancelled' },
        include: 'publication',
      };
    } else if (user.isSubmitter) {
      const userMatch = `submitter.id==${user.id},preparers.id=in=${user.id}`;
      query = {
        filter: {
          submission: `(${userMatch});submissionStatus=out=cancelled`,
        },
        sort: '-submittedDate',
        include: 'publication',
      };
    }

    // TODO: do we need to do anything to limit or not-limit results set size?
    const submissions = this.store.query('submission', query);

    return RSVP.hash({
      submissions,
    });
  }
}
