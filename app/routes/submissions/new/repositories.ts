/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';
import type Workflow from 'pass-ui/services/workflow';
import type PoliciesService from 'pass-ui/services/policies';
import type GrantModel from 'pass-ui/models/grant';
import type FunderModel from 'pass-ui/models/funder';
import type RepositoryModel from 'pass-ui/models/repository';

export default class RepositoriesRoute extends CheckSessionRoute {
  @service declare workflow: Workflow;
  @service declare policies: PoliciesService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repositories: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentModel = this.modelFor('submissions.new') as any;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _getFunderNamesForRepo(repo: RepositoryModel, submission: any): Promise<string> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requiredRepositories(): Promise<any[]> {
    return Promise.all(
      this.repositories?.required.map(async (repo: RepositoryModel) => {
        const funders = await this._getFunderNamesForRepo(repo, this.submission);
        return {
          repository: repo,
          funders,
        };
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async optionalRepositories(): Promise<any[]> {
    return Promise.all(
      this.repositories?.optional.map(async (repo: RepositoryModel) => {
        const funders = await this._getFunderNamesForRepo(repo, this.submission);

        return {
          repository: repo,
          funders,
        };
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async choiceRepositories(): Promise<any[]> {
    const formattedChoices = [];
    const choices = this.repositories['one-of'] ?? [];

    for (const group of choices) {
      const formattedGroup = [];
      for (const repo of group) {
        const funders = await this._getFunderNamesForRepo(repo, this.submission);

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
