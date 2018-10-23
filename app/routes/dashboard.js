import CheckSessionRoute from './check-session-route';
import ENV from 'pass-ember/config/environment';

export default CheckSessionRoute.extend({
  currentUser: Ember.inject.service('current-user'),
  ajax: Ember.inject.service(),
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  async model() {
    const query = {
      bool: {
        must: [
          { term: { submissionStatus: 'approval-requested' } },
          { term: { submitter: this.get('currentUser.user.id') } }
        ],
        filter: { term: { '@type': 'Submission' } }
      }
    };
    let approvalResults = await this.get('ajax').post(ENV.fedora.elasticsearch, {
      data: {
        size: 500, from: 0, query, _source: { excludes: '*_suggest' }
      },
      headers: this.get('headers'),
      xhrFields: { withCredentials: true }
    });
    const secondQuery = {
      bool: {
        must: [
          { term: { submissionStatus: 'changes-requested' } },
          { term: { preparer: this.get('currentUser.user.id') } }
        ],
        filter: { term: { '@type': 'Submission' } }
      },
    };
    let editsResults = await this.get('ajax').post(ENV.fedora.elasticsearch, {
      data: {
        size: 500, from: 0, query: secondQuery, _source: { excludes: '*_suggest' }
      },
      headers: this.get('headers'),
      xhrFields: { withCredentials: true }
    });
    const numberAwaitingEdits = editsResults.hits.total;
    const numberAwaitingApproval = approvalResults.hits.total;

    return {
      numberAwaitingApproval,
      numberAwaitingEdits
    };
  }
});
