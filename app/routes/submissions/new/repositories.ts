/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';

export default class RepositoriesRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare policies: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repositories: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(): Promise<any> {
    const parentModel = this.modelFor('submissions.new');
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
  async _getFunderNamesForRepo(repo: any, submission: any): Promise<string> {
    const grants = await submission.grants;

    const funders = grants.map((grant) => get(grant, 'primaryFunder'));
    const fundersWithRepos = funders.filter((funder) => get(funder, 'policy.repositories'));
    // List of funders that include this repository
    const fundersWithOurRepo = fundersWithRepos.filter(
      (funder) => get(funder, 'policy') && funder.get('policy.repositories').includes(repo),
    );

    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo
        .map((funder) => funder.get('name'))
        .filter((item, index, arr) => arr.indexOf(item) == index)
        .join(', ');
    }
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requiredRepositories(): Promise<any[]> {
    return Promise.all(
      this.repositories?.required.map(async (repo) => {
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
      this.repositories?.optional.map(async (repo) => {
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
