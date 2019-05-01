import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  policyService: service('policies'),

  async model() {
    const parentModel = this.modelFor('submissions.new');
    const submission = parentModel.newSubmission;

    let requiredRepositories = Ember.A();
    let optionalRepositories = Ember.A();
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

    // Delay progressing until repositories have loaded
    const promise = [];

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
      requiredRepositories = policyService.resolveReferences('repository', Ember.A(rules.required));
      promise.push(requiredRepositories.map(req => req.repository));
    }
    if (rules.hasOwnProperty('optional')) {
      optionalRepositories = policyService.resolveReferences('repository', Ember.A(rules.optional));
      promise.push(optionalRepositories.map(opt => opt.repository));
    }
    if (rules.hasOwnProperty('one-of')) {
      rules['one-of'].forEach((choiceSet) => {
        choiceRepositories.push(policyService.resolveReferences('repository', Ember.A(choiceSet)));
        promise.push(choiceRepositories.map(repo => repo.repository));
      });
    }

    return Ember.RSVP.hash({
      newSubmission: submission,
      repoRules: rules,
      preLoadedGrant: parentModel.preLoadedGrant,
      requiredRepositories,
      optionalRepositories,
      choiceRepositories,
      promise: Promise.all(promise)
    });
  },

  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(4);
    }
  }
});
