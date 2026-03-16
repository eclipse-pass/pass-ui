import { action } from '@ember/object';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';
import type Workflow from 'pass-ui/services/workflow';
import type PoliciesService from 'pass-ui/services/policies';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type RepositoryModel from 'pass-ui/models/repository';
import type PolicyModel from 'pass-ui/models/policy';
import type GrantModel from 'pass-ui/models/grant';

interface SubmissionsNewModel {
  newSubmission: SubmissionModel;
  publication: PublicationModel;
  repositories: RepositoryModel[];
  preLoadedGrant: GrantModel | null;
  policies: PolicyModel[];
}

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
  async model(): Promise<SubmissionsNewModel> {
    const parentModel = this.modelFor('submissions.new') as SubmissionsNewModel;
    const submission = parentModel.newSubmission;
    /**
     * Remove current effectivePolicies from the submission because
     * it will be recalculated and added back in this step.
     */
    this.clearEffectivePolicies(submission);

    const policies = await (
      this.policyService.getPolicies as unknown as { perform: (s: SubmissionModel) => Promise<PolicyModel[]> }
    ).perform(submission);

    return hash({
      repositories: parentModel.repositories,
      newSubmission: parentModel.newSubmission,
      publication: parentModel.publication,
      preLoadedGrant: parentModel.preLoadedGrant,
      policies: Promise.all(policies),
    });
  }

  clearEffectivePolicies(submission: SubmissionModel): void {
    submission.effectivePolicies = [];
  }

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(3);
  }
}
