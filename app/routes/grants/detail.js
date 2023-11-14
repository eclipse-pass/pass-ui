import { service } from '@ember/service';
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

    const user = this.currentUser.user;
    const grant = this.store.findRecord('grant', params.grant_id);

    /**
     * TODO:
     * TMP restriction - don't show submissions that are in DRAFT status
     * unless you are the submitter OR preparer
     * Show submissions where `submitted===true`, because they are no longer editable
     */
    const userMatch = `submitted==true,(submitter.id==${user.id},preparers.id=in=${user.id})`;
    const query = {
      filter: {
        submission: `grants.id==${params.grant_id};submissionStatus=out=cancelled;(${userMatch})`,
      },
    };

    const { page = 1, pageSize = 10 } = params;
    query.page = {
      number: page,
      size: pageSize,
      totals: true,
    };

    if (params.filter) {
      query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
    }

    const submissions = this.store.query('submission', query).then((data) => ({ data, meta: data.meta }));

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
