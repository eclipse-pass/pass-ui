import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { grantDetailsQuery } from '../../util/paginated-query';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */

export default class DetailRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  model(params) {
    if (!params || !params.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const grant = this.store.findRecord('grant', params.grant_id, { include: 'pi,coPis' });

    const submissionQuery = grantDetailsQuery(params, params.grant_id, this.currentUser.user);
    const submissions = this.store.query('submission', submissionQuery).then((data) => ({ data, meta: data.meta }));

    return hash({
      grant,
      submissions,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.queuedModel = model;
  }
}
