import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  workflow: service('workflow'),
  submission: alias('model.newSubmission'),
  repositories: alias('model.repositories'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  parent: controller('submissions.new'),

  nextTabIsActive: computed('workflow.maxStep', function () {
    return (this.get('workflow').getMaxStep() > 4);
  }),
  loadingNext: false,
  needValidation: computed('nextTabIsActive', 'loadingNext', function () {
    return (this.get('nextTabIsActive') || this.get('loadingNext'));
  }),

  /*
   * Do some light processing on the repository containers, such as adding the names of funders
   * that both are associated with the submission AND associated with each repository.
   */
  requiredRepositories: computed('model.requiredRepositories', function () {
    let req = this.get('model.requiredRepositories');
    const submission = this.get('submission');

    return req.map(repo => ({
      repository: repo,
      funders: this._getFunderNamesForRepo(repo, submission)
    }));
  }),
  optionalRepositories: computed('model.optionalRepositories', function () {
    const submission = this.get('submission');
    let optionals = this.get('model.optionalRepositories');

    return optionals.map(repo => ({
      repository: repo,
      funders: this._getFunderNamesForRepo(repo, submission)
    }));
  }),
  choiceRespositories: computed('model.choiceRepositories', function () {
    const submission = this.get('submission');
    let choices = this.get('model.choiceRepositories');

    choices.forEach((group) => {
      group.map(repo => ({
        repository: repo,
        funders: this._getFunderNamesForRepo(repo, submission)
      }));
    });
    return choices;
  }),

  actions: {
    loadNext() {
      this.set('loadingNext', true);
      this.send('validateAndLoadTab', 'submissions.new.metadata');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.policies');
    },
    loadTab(gotoRoute) {
      this.get('submission').save().then(() => {
        this.transitionToRoute(gotoRoute);
        this.set('loadingNext', false); // reset for next time
      });
    },
    validateAndLoadTab(gotoRoute) {
      let needValidation = this.get('needValidation');
      if (needValidation && this.get('submission.repositories.length') == 0) {
        swal({
          type: 'warning',
          title: 'No repositories selected',
          html: 'If you don\'t plan on submitting to any repositories, you can stop at this time. Click "Exit '
                + 'submission" to return to the dashboard, or "Continue submission" to go back and select a repository',
          showCancelButton: true,
          cancelButtonText: 'Exit Submission',
          confirmButtonText: 'Continue submission'
        }).then((value) => {
          if (value.dismiss) {
            this.transitionToRoute('dashboard');
          }
        });
        // do nothing
      } else {
        this.send('loadTab', gotoRoute);
      }
    },

    abort() {
      this.get('parent').send('abort');
    }
  },

  _getFunderNamesForRepo(repo, submission) {
    const funders = submission.get('grants').map(grant => grant.get('primaryFunder'));
    const fundersWithRepos = funders.filter(funder => funder.get('policy.repositories'));
    // List of funders that include this repository
    const fundersWithOurRepo = fundersWithRepos.filter(funder => funder.get('policy') &&
      funder.get('policy.repositories').includes(repo));

    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo.map(funder => funder.get('name'))
        .filter((item, index, arr) => arr.indexOf(item) == index).join(', ');
    }
    return '';
  }
});
