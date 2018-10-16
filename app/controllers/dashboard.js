import Controller from '@ember/controller';
import { computed } from '@ember/object';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  ajax: Ember.inject.service(),

  isSubmitter: Ember.computed('currentUser', () =>
    this.get('currentUser.user.roles').includes('submitter')),

  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  numberAwaitingEdits: 0,
  NumberAwaitingApproval: 0,
  setNumberAwaitingApproval() {
    // Gets the number of submissions where the current user
    // (the submitter) is expected to review the preparer's work and perform an action.
    const query = {
      bool: {
        must: [
          { term: { submissionStatus: 'approval-requested' } },
          { term: { submitter: this.get('currentUser.user.id') } }
        ],
        filter: { term: { '@type': 'Submission' } }
      }
    };
    return this.get('ajax').post(ENV.fedora.elasticsearch, {
      data: {
        size: 500, from: 0, query, _source: { excludes: '*_suggest' }
      },
      headers: this.get('headers'),
      xhrFields: { withCredentials: true }
    }).then((results) => { this.set('numberAwaitingApproval', results.hits.total); });
  },
  setNumberAwaitingEdits() {
    // Gets the number of submissions where the
    // current user (the preparer) is expected to edit them.
    query = {
      bool: {
        must: [
          { term: { submissionStatus: 'changes-requested' } },
          { term: { preparer: this.get('currentUser.user.id') } }
        ],
        filter: { term: { '@type': 'Submission' } }
      },
    };
    this.get('ajax').post(ENV.fedora.elasticsearch, {
      data: {
        size: 500, from: 0, query, _source: { excludes: '*_suggest' }
      },
      headers: this.get('headers'),
      xhrFields: { withCredentials: true }
    }).then((results) => { this.set('numberAwaitingEdits', results.hits.total); });
  },
  init() {
    this.setNumberAwaitingApproval();
    this.setNumberAwaitingEdits();
    return this._super();
  }
});
