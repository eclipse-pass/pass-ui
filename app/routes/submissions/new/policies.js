import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  /**
   * First call the Policy Service to get the list of applicable policy IDs.
   * Then for each of the returned policies, do not resolve this function until all
   * policy model objects have been retrieved from the Store.
   *
   * @returns {object} /submissions/new/policies model
   * {
   *  newSubmission,
   *  publication, // Probably get rid of this after merging in Journal Service
   *  repositories, // ??
   *  preLoadedGrant,
   *  policies: [
   *    {
   *      id: '',
   *      type: 'funder|institution', // type string
   *      policy: {} // Ember.Object - the actual policy model object
   *    }
   *  ]
   * }
   */
  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    let results = await this.get('policyService').getPolicies(submission);

    // Weed out duplicates
    let policies = Ember.A();
    results.forEach((res) => {
      if (!policies.isAny('id', res.id)) {
        policies.push(res);
      }
    });

    policies = this.get('policyService').resolveReferences('policy', policies);

    /*
     * This holds references to the Promises that resolve each Policy model object
     * and will pause the #model() function until they are finished
     * The model objects are then available here OR in the 'policies' array
     * though the user of 'policies' is preferred
     */
    const policyPromise = policies.map(p => p.policy);

    return Ember.RSVP.hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      preLoadedGrant: parentModel.preLoadedGrant,
      policyPromise,
      policies
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(3);
    }
  }
});
