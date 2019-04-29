import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    let requiredRepositories;
    let optionalRepositories;
    let choiceRepositories = Ember.A();

    const policyService = this.get('policyService');
    const rules = await policyService.getRepositories(submission);

    const currentRepos = submission.get('repositories');
    if (currentRepos && currentRepos.length > 0) {
      /*
        * Check returned repositories against any repositories already set in the current submission.
        * Make sure all repositories present in the submission have `selected: true` in the returned
        * lists, overriding default behavior.
        */
      if (rules.optional) {
        rules.optional.forEach((opt) => {
          opt.selected = currentRepos.isAny('id', opt.url);
        });
      }
      if (rules['one-of']) {
        rules['one-of'].forEach((choice) => {
          choice.forEach((opt) => {
            opt.selected = currentRepos.isAny('id', opt.url);
          });
        });
      }
    }

    /**
     * Once 'requiredRepositories' 'optionalRepositories' and 'choiceRepositories', each ultimate
     * element should look like:
     * {
     *    url: '',
     *    repository: {}, // Ember model object
     *    selected: true|false
     * }
     */
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

    return Ember.RSVP.hash({
      newSubmission: submission,
      repoRules: rules,
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
