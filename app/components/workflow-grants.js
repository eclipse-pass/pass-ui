import WorkflowComponent from './workflow-component';
import { Promise, } from 'rsvp';
import { inject as service } from '@ember/service';

export default WorkflowComponent.extend({
  store: service('store'),

  optionalGrants: Ember.computed('model', function () {
    return this.get('model.grants');
  }),

  submissionGrants: Ember.computed('model.newSubmission', function () {
    return this.get('model.newSubmission.grants');
  }),
  sortedGrants: Ember.computed('model.newSubmission.grants.[]', function () {
    const subGrants = this.get('model.newSubmission.grants');
    return this.get('model.grants').filter(grant => !subGrants || !subGrants.includes(grant));
  }),
  init() {
    this._super(...arguments);
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
        this.set('maxStep', 2);
        submission.set('metadata', '[]');
      } else if (event && event.target.value) {
        this.get('store').findRecord('grant', event.target.value).then((g) => {
          g.get('primaryFunder.policy'); // Make sure policy is loaded in memory
          const submission = this.get('model.newSubmission');
          submission.get('grants').pushObject(g);
          this.set('maxStep', 2);
          submission.set('metadata', '[]');
          Ember.$('select')[0].selectedIndex = 0;
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
      this.set('maxStep', 2);
      submission.set('metadata', '[]');
    },
  },
});
