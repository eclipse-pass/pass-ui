import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    const repoPromise = await this.get('policyService').getRepositories(submission);

    /**
     * Can't directly use 'one-of' directly in the RSVP hash, because it is an array of arrays of Promises,
     * so to force the RSVP hash to wait for them all, we need to flatten the weird structure.
     */
    const choices = [];
    if (repoPromise['one-of']) {
      repoPromise['one-of'].forEach((choiceGroup) => { choices.push(...choiceGroup); });
    }

    return Ember.RSVP.hash({
      newSubmission: submission,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories: Promise.all(repoPromise.required),
      optionalRepositories: Promise.all(repoPromise.optional),
      choiceRepositories: Promise.all(repoPromise['one-of']),
      promise: Promise.all(choices)
      // promise: Promise.all(promise)
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(4);
    }
  }
});
