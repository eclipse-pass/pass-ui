/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';

export default class RepositoriesRoute extends CheckSessionRoute {
  @service('workflow')
  workflow;

  @service('policies')
  policyService;

  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    const repoPromise = await get(this, 'policyService.getRepositories').perform(submission);

    return hash({
      newSubmission: submission,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories: repoPromise.required,
      optionalRepositories: repoPromise.optional,
      choiceRepositories: repoPromise['one-of'],
    });
  }

  @action
  didTransition() {
    this.workflow.setCurrentStep(4);
  }
}
