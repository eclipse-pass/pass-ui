
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
  model(params, transition) {
    if (!params || !params.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    let grant = this.store.findRecord('grant', params.grant_id);

    const query = {
      bool: {
        must: { term: { grants: params.grant_id } },
        must_not: { term: { submissionStatus: 'cancelled' } }
      },
      size: 500
    };
    let submissions = this.store.query('submission', query);

    return hash({
      grant,
      submissions
    });
  }
}
