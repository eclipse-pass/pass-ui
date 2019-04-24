import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

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
    // TODO: will the 'policy' promise resolve correctly??
    const policyPromise = this.get('policyService').getPolicies(submission)
      .then(results => this.get('policyService').resolveReferences('policy', results));

    return Ember.RSVP.hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      preLoadedGrant: parentModel.preLoadedGrant,
      policies: policyPromise
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(3);
    }
  }
});
