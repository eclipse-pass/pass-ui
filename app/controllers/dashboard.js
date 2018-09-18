import Controller from '@ember/controller';
import { computed } from '@ember/object';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  isSubmitter: Ember.computed('currentUser', () =>
    this.get('currentUser.user.roles').includes('submitter')),
  ajax: Ember.inject.service(),
  numberAwaitingApproval: null,
  numberAwaitingEdits: null,
  base: Ember.computed(() => ENV.fedora.elasticsearch),
  statsLoaded: false,
  _headers() {
    return {
      'Content-Type': 'application/json; charset=utf-8'
    };
  },
  init() {
    this.get('ajax').post(this.get('base'), {
      data: {
        "size":500,
        "from":0,
        "query":{
          "bool":{
            // "must":{
            //   "term":{
            //     "submissionStatus": "submitted"
            //   }
            // },
            "filter":{
              "term":{
                "@type":"Submission"
              }
            }
          }, 
        },
        "_source":{"excludes":"*_suggest"}},
      headers: this._headers(),
      xhrFields: { withCredentials: true }
    }).then((results) => {
      this.set('numberAwaitingEdits', results.hits.total);
    });
    this.get('ajax').post(this.get('base'), {
      data: {
        "size":500,
        "from":0,
        "query":{
          "bool":{
            // "must":{
            //   "term":{
            //     "submissionStatus": "submitted"
            //   }
            // },
            "filter":{
              "term":{
                "@type":"Submission"
              }
            }
          }, 
        },
        "_source":{"excludes":"*_suggest"}},
      headers: this._headers(),
      xhrFields: { withCredentials: true }
    }).then((results) => {
      this.set('numberAwaitingApproval', results.hits.total + 1);
    });
    return this._super();
  }
});
