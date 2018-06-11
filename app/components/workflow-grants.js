import Component from '@ember/component';
import { Promise, } from 'rsvp';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  grant: null,
  /** Holds all newly-added grants */
  addedGrants: [],
  optionalGrants: Ember.computed('model', function () {
    return this.get('model.grants');
  }),

  submissionGrants: Ember.computed('model.newSubmission', function () {
    return this.get('model.newSubmission.grants');
  }),
  didRender() {
    if (this.get('model.preLoadedGrant')) {
      this.send('addGrant', this.get('model.preLoadedGrant'));
    }
  },
  actions: {
    next() {
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    addGrant(grant, event) {
      if (grant) {
        const submission = this.get('model.newSubmission');
        submission.get('grants').pushObject(grant);
        this.get('addedGrants').push(grant);
        this.set('maxStep', 2);
        submission.set('metadata', '[]');
      } else if (event && event.target.value) {
        this.get('store').findRecord('grant', event.target.value).then((g) => {
          const submission = this.get('model.newSubmission');
          submission.get('grants').pushObject(g);
          this.get('addedGrants').push(g);
          this.set('maxStep', 2);
          submission.set('metadata', '[]');
        });
      }
    },
    removeGrant(grant) {
      // if grant is grant passed in from grant detail page remove query parms
      if (grant === this.get('model.preLoadedGrant')) {
        this.set('model.preLoadedGrant', null);
      }
      const submission = this.get('model.newSubmission');
      submission.get('grants').removeObject(grant);
      const index = this.get('addedGrants').indexOf(grant);
      this.get('addedGrants').splice(index, 1);
      this.set('maxStep', 2);
      submission.set('metadata', '[]');
    },
    saveAll() {
      const grants = this.get('addedGrants');
      this.set('addedGrants', []);
      const submission = this.get('model.newSubmission');

      return Promise.all(grants.map((grant) => {
        grant.get('submissions').pushObject(submission);
        return grant.save();
      })).then(() => submission.save());
    },
  },
});
