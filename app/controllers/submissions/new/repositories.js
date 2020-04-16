import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SubmissionsNewPolicies extends Controller {
  @service workflow;

  @alias('model.newSubmission') submission;
  @alias('model.repositories') repositories;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  parent = controller('submissions.new');

  @tracked maxStep = this.workflow.maxStep;
  @tracked loadingNext = false;
  @tracked requiredRepos = this.model.requiredRepositories;
  @tracked optionalRepos = this.model.optionalRepositories;
  @tracked choiceRepos = this.model.choiceRepositories;

  get nextTabIsActive() {
    return this.maxStep > 4;
  }

  get needValidation() {
    return this.nextTabIsActive || this.loadingNext;
  }

  /*
   * Do some light processing on the repository containers, such as adding the names of funders
   * that both are associated with the submission AND associated with each repository.
   */
  get requiredRepositories() {
    let req = this.requiredRepos;
    const submission = this.submission;

    return req.map(repo => ({
      repository: repo,
      funders: this._getFunderNamesForRepo(repo, submission)
    }));
  }

  get optionalRepositories() {
    const submission = this.submission;
    let optionals = this.optionalRepos;

    return optionals.map(repo => ({
      repository: repo,
      funders: this._getFunderNamesForRepo(repo, submission)
    }));
  }

  get choiceRespositories() {
    const submission = this.submission;
    let choices = this.choiceRepos;

    choices.forEach((group) => {
      group.map(repo => ({
        repository: repo,
        funders: this._getFunderNamesForRepo(repo, submission)
      }));
    });
    return choices;
  }

  @action
  loadNext() {
    set(this, 'loadingNext', true);
    this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.policies');
  }

  @action
  async loadTab(gotoRoute) {
    await this.submission.save();
    this.transitionToRoute(gotoRoute);
    set(this, 'loadingNext', false); // reset for next time
  }

  @action
  async validateAndLoadTab(gotoRoute) {
    let needValidation = this.needValidation;
    if (needValidation && get(this, 'submission.repositories.length') == 0) {
      let value = await swal({
        type: 'warning',
        title: 'No repositories selected',
        html: 'If you don\'t plan on submitting to any repositories, you can stop at this time. Click "Exit '
              + 'submission" to return to the dashboard, or "Continue submission" to go back and select a repository',
        showCancelButton: true,
        cancelButtonText: 'Exit Submission',
        confirmButtonText: 'Continue submission'
      });

      if (value.dismiss) {
        this.transitionToRoute('dashboard');
      }
      // do nothing
    } else {
      this.loadTab(gotoRoute);
    }
  }

  @action
  abort() {
    this.parent.abort();
  }

  @action
  updateCovidSubmission() {
    get(this, 'parent').send('updateCovidSubmission')
  }

  _getFunderNamesForRepo(repo, submission) {
    const funders = get(submission, 'grants').map(grant => get(grant, 'primaryFunder'));
    const fundersWithRepos = funders.filter(funder => get(funder, 'policy.repositories'));
    // List of funders that include this repository
    const fundersWithOurRepo = fundersWithRepos.filter(funder => get(funder, 'policy') &&
      funder.get('policy.repositories').includes(repo));

    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo.map(funder => get(funder, 'name'))
        .filter((item, index, arr) => arr.indexOf(item) == index).join(', ');
    }
    return '';
  }
}
