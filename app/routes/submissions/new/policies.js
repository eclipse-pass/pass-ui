import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),
  store: service('store'),

  /**
   * @returns {object} /submissions/new/policies model
   * {
   *  newSubmission,
   *  publication, // Probably get rid of this after merging in Journal Service
   *  repositories, // ??
   *  preLoadedGrant,
   *  policies: [
   *    {
   *      type: 'funder|institution', // type string
   *      policy: {} // Ember.Object - the actual policy model object
   *    }
   *  ]
   * }
   */
  model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    const policyPromise = this.get('policyService').getPolicies(submission)
      .then((results) => {
        results.map(item => ({
          type: item.type,
          policy: this.get('store').findRecord('policy', item.id)
        }));
      });

    return Ember.RSVP.hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      // policies: parentModel.policies,
      preLoadedGrant: parentModel.preLoadedGrant,
      policies: policyPromise
    });
    // return Ember.RSVP.hash(Object.assign(parentModel, {
    //   policies: policyPromise
    // }));
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(3);
    }
  }
});
