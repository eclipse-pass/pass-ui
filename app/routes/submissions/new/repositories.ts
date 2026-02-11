/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { service } from '@ember/service';
import { hash } from 'rsvp';
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

    return hash({
      newSubmission: this.submission,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories: this.requiredRepositories(),
      optionalRepositories: this.optionalRepositories(),
      choiceRepositories: this.choiceRepositories(),
    });
  }

  async _getFunderNamesForRepo(repo: RepositoryModel, submission: SubmissionModel): Promise<string> {
    const grants = await submission.grants;

    const funders = grants.map((grant: GrantModel) => get(grant, 'primaryFunder'));
    const fundersWithRepos = funders.filter((funder: FunderModel) => get(funder, 'policy.repositories'));
    // List of funders that include this repository
    const fundersWithOurRepo = fundersWithRepos.filter(
      (funder: FunderModel) =>
        get(funder, 'policy') && (funder.get('policy.repositories') as unknown as RepositoryModel[]).includes(repo),
    );

    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo
        .map((funder: FunderModel) => funder.get('name'))
        .filter((item: string, index: number, arr: string[]) => arr.indexOf(item) == index)
        .join(', ');
    }
    return '';
  }

  async requiredRepositories(): Promise<RepositoryWithFunders[]> {
    return Promise.all(
      this.repositories?.required?.map(async (repo: RepositoryModel) => {
        const funders = await this._getFunderNamesForRepo(repo, this.submission!);
        return {
          repository: repo,
          funders,
        };
      }) ?? [],
    );
  }

  async optionalRepositories(): Promise<RepositoryWithFunders[]> {
    return Promise.all(
      this.repositories?.optional?.map(async (repo: RepositoryModel) => {
        const funders = await this._getFunderNamesForRepo(repo, this.submission!);

        return {
          repository: repo,
          funders,
        };
      }) ?? [],
    );
  }

  async choiceRepositories(): Promise<RepositoryWithFunders[][]> {
    const formattedChoices = [];
    const choices = this.repositories?.['one-of'] ?? [];

    for (const group of choices) {
      const formattedGroup = [];
      for (const repo of group) {
        const funders = await this._getFunderNamesForRepo(repo, this.submission!);

        formattedGroup.push({
          repository: repo,
          funders,
        });
      }

      formattedChoices.push(formattedGroup);
    }

    return formattedChoices;
  }

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(4);
  }
}
