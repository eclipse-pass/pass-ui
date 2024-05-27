import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  /**
   * TODO: Should be able to streamline this.
   * Can we use the 'include' parameter: search for submissions, as below
   * and sideload the grants data with it?
   *
   * Returns model:
   *  [
   *    {
   *      'grant': { ... },
   *      'submissions': [ ... ]
   *    },
   *    ...
   *  ]
   */
  async model(params) {
    const user = this.currentUser.user;
    if (!user) {
      return;
    }

    const grantQuery = grantsIndexGrantQuery(params, user);
    // First search for all Grants associated with the current user
    const grants = await this.store.query('grant', grantQuery);
    let results = {
      grantMap: [],
      meta: grants.meta,
    };

    grants.forEach((grant) => {
      results.grantMap.push({
        grant,
        submissions: [],
      });
    });

    // TODO: submissions should be fetched separately from grants
    // We can redo the mapping of submissions onto grants (to get the count)
    // On demand without reloading the list of submissions
    const submissionQuery = grantsIndexSubmissionQuery(user);
    const subs = await this.store.query('submission', submissionQuery);
    subs.forEach((submission) => {
      submission.grants.forEach((grant) => {
        let match = results.grantMap.find((res) => res.grant.id === grant.id);
        if (match) {
          match.submissions.pushObject(submission);
        }
      });
    });

    return results;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.queuedModel = model;
  }
}
