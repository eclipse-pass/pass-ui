import { hash } from 'rsvp';
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
   *    Policy
   *  ]
   * }
   */
  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    // Weed out duplicates, while also resolving Policy objects
    // let policies = Ember.A();
    // results.forEach(async (res) => {
    //   if (!policies.isAny('id', res.id)) {
    //     policies.push(res);
    //   }
    // });

    /**
     * Remove current effectivePolicies from the submission because
     * it will be recalculated and added back in this step.
     */
    this.clearEffectivePolicies(submission);

    const policies = await this.get('policyService.getPolicies').perform(submission);

    return hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      preLoadedGrant: parentModel.preLoadedGrant,
      policies: Promise.all(policies)
    });
  },

  clearEffectivePolicies(submission) {
    submission.get('effectivePolicies').clear();
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(3);
    }
  }
});
