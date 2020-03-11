import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    const repoPromise = await this.get('policyService.getRepositories').perform(submission);

    return hash({
      newSubmission: submission,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories: repoPromise.required,
      optionalRepositories: repoPromise.optional,
      choiceRepositories: repoPromise['one-of']
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(4);
    }
  }
});
