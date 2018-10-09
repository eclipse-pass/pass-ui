import Controller from '@ember/controller';
import { computed } from '@ember/object';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  isSubmitter: Ember.computed('currentUser', () =>
    this.get('currentUser.user.roles').includes('submitter')),
  ajax: Ember.inject.service(),
  base: Ember.computed(() => ENV.fedora.elasticsearch),
  statsLoaded: true,
  _headers() {
    return {
      'Content-Type': 'application/json; charset=utf-8'
    };
  },
  numberAwaitingApproval: Ember.computed('currentUser.user', function () {
    return this.get('ajax').post(this.get('base'), {
      data: {
        size: 500,
        from: 0,
        query: {
          constant_score: {
            filter: {
              bool: {
                must: [
                  { term: { submissionStatus: 'approval-requested' } },
                  { terms: { preparer: [this.get('currentUser.user.id')] } }
                ],
                filter: {
                  term: {
                    '@type': 'Submission'
                  }
                }
              },
            }
          }
        },
        _source: { excludes: '*_suggest' }
      },
      headers: this._headers(),
      xhrFields: { withCredentials: true }
    }).then((results) => {
      console.log(results);
      this.set('numberAwaitingApproval', results.hits.total);
      return results.hits.total;
    });
  }),
  numberAwaitingEdits: Ember.computed('currentUser.user', function () {
    this.get('ajax').post(this.get('base'), {
      data: {
        size: 500,
        from: 0,
        query: {
          constant_score: {
            filter: {
              bool: {
                must: [
                  { term: { submissionStatus: 'approval-requested' } },
                  { term: { submitter: this.get('currentUser.user.id') } }
                ],
                filter: {
                  term: {
                    '@type': 'Submission'
                  }
                }
              },
            }
          }
        },
        _source: { excludes: '*_suggest' }
      },
      headers: this._headers(),
      xhrFields: { withCredentials: true }
    }).then((results) => {
      this.set('statsLoaded', true);
      console.log(results.hits.total);
      this.set('numberAwaitingEdits', results.hits.total);
      return results.hits.total;
    });
  }),
  init() {
    return this._super();
  }
});
