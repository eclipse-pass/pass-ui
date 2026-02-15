import { action } from '@ember/object';
import { service } from '@ember/service';
import CheckSessionRoute from '../../check-session-route';
import type Workflow from 'pass-ui/services/workflow';
import type PoliciesService from 'pass-ui/services/policies';
import type { RepoDslResult } from 'pass-ui/services/policies';
import type GrantModel from 'pass-ui/models/grant';
import type FunderModel from 'pass-ui/models/funder';
import type RepositoryModel from 'pass-ui/models/repository';
import type SubmissionModel from 'pass-ui/models/submission';

interface RepositoryWithFunders {
  repository: RepositoryModel;
  funders: string;
}

interface RepositoriesModel {
  newSubmission: SubmissionModel;
  preLoadedGrant: GrantModel | null;
  requiredRepositories: RepositoryWithFunders[];
  optionalRepositories: RepositoryWithFunders[];
  choiceRepositories: RepositoryWithFunders[][];
}

interface NewSubmissionParentModel {
  newSubmission: SubmissionModel;
  preLoadedGrant: GrantModel | null;
}

export default class RepositoriesRoute extends CheckSessionRoute {
  @service declare workflow: Workflow;
  @service declare policies: PoliciesService;

  submission: SubmissionModel | null = null;
  repositories: RepoDslResult | null = null;

  async model(): Promise<RepositoriesModel> {
    const parentModel = this.modelFor('submissions.new') as NewSubmissionParentModel;
    this.submission = parentModel.newSubmission;

    this.repositories = await this.policies.getRepositories.perform(this.submission);

    return {
      newSubmission: this.submission,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories: this.requiredRepositories(),
      optionalRepositories: this.optionalRepositories(),
      choiceRepositories: this.choiceRepositories(),
    };
  }

  _getFunderNamesForRepo(repo: RepositoryModel, submission: SubmissionModel): string {
    const grants = submission.grants;

    const funders = grants.map((grant: GrantModel) => grant.primaryFunder);
    const fundersWithRepos = funders.filter((funder: FunderModel) => funder?.policy?.repositories);
    // List of funders that include this repository
    const fundersWithOurRepo = fundersWithRepos.filter((funder: FunderModel) =>
      funder?.policy?.repositories?.includes(repo),
    );

    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo
        .map((funder: FunderModel) => funder.name)
        .filter((item: string, index: number, arr: string[]) => arr.indexOf(item) == index)
        .join(', ');
    }
    return '';
  }

  requiredRepositories(): RepositoryWithFunders[] {
    return (
      this.repositories?.required?.map((repo: RepositoryModel) => ({
        repository: repo,
        funders: this._getFunderNamesForRepo(repo, this.submission!),
      })) ?? []
    );
  }

  optionalRepositories(): RepositoryWithFunders[] {
    return (
      this.repositories?.optional?.map((repo: RepositoryModel) => ({
        repository: repo,
        funders: this._getFunderNamesForRepo(repo, this.submission!),
      })) ?? []
    );
  }

  choiceRepositories(): RepositoryWithFunders[][] {
    const choices = this.repositories?.['one-of'] ?? [];

    return choices.map((group) =>
      group.map((repo) => ({
        repository: repo,
        funders: this._getFunderNamesForRepo(repo, this.submission!),
      })),
    );
  }

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(4);
  }
}
