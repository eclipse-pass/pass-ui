/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import ENV from 'pass-ui/config/environment';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service('ajax') ajax;

  headers = { 'Content-Type': 'application/json; charset=utf-8' };

  async model() {
    const query = {
      bool: {
        must: [
          { term: { submissionStatus: 'approval-requested' } },
          { term: { submitter: get(this, 'currentUser.user.id') } },
        ],
        filter: { term: { '@type': 'Submission' } },
      },
    };
    let approvalResults = await this.ajax.post(ENV.fedora.elasticsearch, {
      data: {
        size: 500,
        from: 0,
        query,
        _source: { excludes: '*_suggest' },
      },
      headers: this.headers,
      xhrFields: { withCredentials: true },
    });
    const secondQuery = {
      bool: {
        must: [
          { term: { submissionStatus: 'changes-requested' } },
          { term: { preparers: get(this, 'currentUser.user.id') } },
        ],
        filter: { term: { '@type': 'Submission' } },
      },
    };
    let editsResults = await this.ajax.post(ENV.fedora.elasticsearch, {
      data: {
        size: 500,
        from: 0,
        query: secondQuery,
        _source: { excludes: '*_suggest' },
      },
      headers: this.headers,
      xhrFields: { withCredentials: true },
    });
    const numberAwaitingEdits = editsResults.hits.total;
    const numberAwaitingApproval = approvalResults.hits.total;

    return {
      numberAwaitingApproval,
      numberAwaitingEdits,
    };
  }
}
