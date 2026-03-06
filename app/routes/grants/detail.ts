import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { query, findRecord } from '@ember-data/legacy-compat/builders';
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
  async model(params: any) {
    if (!params || !params.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const grantPromise = this.store
      .request(findRecord('grant', params.grant_id, { include: 'pi,coPis,primaryFunder,directFunder' }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => result.content);

    const submissionQueryHash = grantDetailsQuery(params, params.grant_id, this.currentUser.user!);
    const submissionsPromise = this.store
      .request(query('submission', submissionQueryHash))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => ({ data: result.content, meta: result.content.meta }));

    return hash({
      grant: grantPromise,
      submissions: submissionsPromise,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupController(controller: any, model: any) {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
