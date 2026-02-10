/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';
import type Workflow from 'pass-ui/services/workflow';
import type PoliciesService from 'pass-ui/services/policies';

export default class PoliciesRoute extends CheckSessionRoute {
  @service('workflow')
  declare workflow: Workflow;

  @service('policies')
  declare policyService: PoliciesService;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(): Promise<any> {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;
    /**
     * Remove current effectivePolicies from the submission because
     * it will be recalculated and added back in this step.
     */
    this.clearEffectivePolicies(submission);

    const policies = await get(this, 'policyService.getPolicies').perform(submission);

    return hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      preLoadedGrant: parentModel.preLoadedGrant,
      policies: Promise.all(policies),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clearEffectivePolicies(submission: any): void {
    submission.effectivePolicies = [];
  }

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(3);
  }
}
