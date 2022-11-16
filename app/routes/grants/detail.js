import { inject as service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */

export default class DetailRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;

  model(params, transition) {
    if (!params || !params.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const user = get(this, 'currentUser.user');

    let grant = this.store.findRecord('grant', params.grant_id);

    const userMatch = `submitter.id==${user.get('id')},preparers.id=in=${user.get('id')}`;
    const query = {
      filter: {
        submission: `grants.id==${params.grant_id};submissionStatus=out=cancelled;(${userMatch})`,
      },
    };
    let submissions = this.store.query('submission', query);

    return hash({
      grant,
      submissions,
    });
  }
}
