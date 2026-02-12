import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { grantDetailsQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */

export default class DetailRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model(params: any) {
    if (!params || !params.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const grant = this.store.findRecord('grant', params.grant_id, { include: 'pi,coPis' });

    const submissionQuery = grantDetailsQuery(params, params.grant_id, this.currentUser.user!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submissions = this.store
      .query('submission', submissionQuery)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => ({ data, meta: data.meta }));

    return hash({
      grant,
      submissions,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupController(controller: any, model: any) {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
