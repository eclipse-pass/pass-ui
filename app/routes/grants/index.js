import { service } from '@ember/service';
import { A } from '@ember/array';
import CheckSessionRoute from '../check-session-route';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 500;

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: { refreshModel: true },
    pageSize: { refreshModel: true },
    filter: { refreshModel: true },
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

    return this.getModel.perform(user.id, params);
  }

  @restartableTask
  getModel = function* (userId, params) {
    yield timeout(DEBOUNCE_MS);

    // default values provided to force these params in the request to the backend
    // TODO: make default pageSize configurable
    const { page = 1, pageSize = 10 } = params;
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '+awardStatus,-endDate',
      page: {
        number: page,
        size: pageSize,
        totals: true,
      },
    };

    if (params.filter) {
      grantQuery.filter.grant = `(${grantQuery.filter.grant});projectName=ini=*${params.filter}*`;
    }

    // First search for all Grants associated with the current user
    const grants = yield this.store.query('grant', grantQuery);
    let results = {
      grantMap: [],
      meta: grants.meta,
    };

    grants.forEach((grant) => {
      results.grantMap.push({
        grant,
        submissions: A(),
      });
    });

    const userMatch = `grants.pi.id==${userId},grants.coPis.id==${userId}`;
    const submissionQuery = {
      filter: {
        submission: `submissionStatus=out=cancelled;(${userMatch})`,
      },
    };

    const subs = yield this.store.query('submission', submissionQuery);
    subs.forEach((submission) => {
      submission.grants.forEach((grant) => {
        let match = results.grantMap.find((res) => res.grant.id === grant.id);
        if (match) {
          match.submissions.pushObject(submission);
        }
      });
    });

    return results;
  };
}
