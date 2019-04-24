import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    let requiredRepositories;
    let optionalRepositories;
    let choiceRepositories = Ember.A();

    const policyService = this.get('policyService');
    const repoPromise = policyService.getRepositories(submission)
      .then((rules) => {
        const currentRepos = submission.get('repositories');
        if (currentRepos && currentRepos.length > 0) {
          /*
            * Check returned repositories against any repositories already set in the current submission.
            * Make sure all repositories present in the submission have `selected: true` in the returned
            * lists.
            */
          if (rules.optional) {
            rules.optional.forEach((opt) => {
              if (currentRepos.isAny('id', opt.url)) {
                opt.selected = true;
              } else {
                opt.selected = false;
              }
            });
          }
          if (rules['one-of']) {
            rules['one-of'].forEach((choice) => {
              choice.forEach((opt) => {
                if (currentRepos.isAny('id', opt.url)) {
                  opt.selected = true;
                } else {
                  opt.selected = false;
                }
              });
            });
          }
        }
      })
      .then((rules) => {
        if (rules.hasOwnProperty('required')) {
          requiredRepositories = policyService.resolveReferences('repository', rules.required);
        }
        if (rules.hasOwnProperty('optional')) {
          optionalRepositories = policyService.resolveReferences('repository', rules.optional);
        }
        if (rules.hasOwnProperty('one-of')) {
          rules['one-of'].forEach((choiceSet) => {
            choiceRepositories.push(policyService.resolveReferences('repository', choiceSet));
          });
        }
      });

    return Ember.RSVP.hash({
      newSubmission: submission,
      repoRules: repoPromise,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories,
      optionalRepositories,
      choiceRepositories
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(4);
    }
  }
});
