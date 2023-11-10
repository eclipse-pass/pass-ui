import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
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

  async model(params) {
    return RSVP.hash({
      submissions: this.getSubmissions.perform(this.currentUser.user, params),
    });
  }

  @restartableTask
  getSubmissions = function* (user, params) {
    yield timeout(DEBOUNCE_MS);

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

    const { page = 1, pageSize = 10 } = params;
    query.page = {
      number: page,
      size: pageSize,
      totals: true,
    };

    if (params.filter) {
      query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
    }

    return this.store.query('submission', query);
  };
}
