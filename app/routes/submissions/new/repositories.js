/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import CheckSessionRoute from '../../check-session-route';

export default class RepositoriesRoute extends CheckSessionRoute {
  @service workflow;
  @service policies;

  async model() {
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

  async _getFunderNamesForRepo(repo, submission) {
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

  async requiredRepositories() {
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

  async optionalRepositories() {
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

  async choiceRepositories() {
    let formattedChoices = [];
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
  didTransition() {
    this.workflow.setCurrentStep(4);
  }
}
