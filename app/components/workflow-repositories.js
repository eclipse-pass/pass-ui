import Component from '@ember/component';
import { inject as service, } from '@ember/service';

/**
 * Display required, optional, and choice repositories to a user. The user can interact with
 * this list to select or deselect some repositories. The list of repositories selected by
 * the user and those that are required are added to the submission.
 *
 * model: {
 *  submission,
 *  requiredRepositories,
 *  optionalRepositories,
 *  choiceRepositories
 * }
 *
 * Required repositories are those that MUST be added to the submission according to policies
 * that have already been applied.
 *
 * Optional repositories may be added to the submission. The user is free to pick whether or not
 * they are added.
 *
 * "Choice" repositories refer to a set of repositories, from which the user must select one or
 * more to be added to the submission. Choice repositories are provided to this component as an
 * array of arrays of strings.
 *
 * TODO: add an onChange handler to pass `repository-card` components that can validate selection
 * of repositories
 */
export default Component.extend({
  workflow: service('workflow'),

  willRender() {
    this._super(...arguments);

    const currentRepos = this.get('submission.repositories');
    if (currentRepos && currentRepos.length > 0) {
      /**
       * Check returned repositories against any repositories already set in the current submission.
       * Make sure all repositories present in the submission have `selected: true` in the returned
       * lists.
       */
      this.get('optionalRepositories').forEach((opt) => {
        opt.selected = currentRepos.isAny('id', opt.repository.get('id'));
      });
    } else {
      /**
       * If no repositories have been saved to the submission yet, force add all required repositories
       * as well as any other repositories marked as 'selected
       */

    }
  },

  actions: {
    addRepository(repositoryToAdd) {
      let submissionIncludesRepo = this.get('submission.repositories').includes(repositoryToAdd);
      if (!submissionIncludesRepo) {
        this.get('submission.repositories').pushObject(repositoryToAdd);
      }
      this.get('workflow').setMaxStep(4);
    },
    removeRepository(repositoryToRemove) {
      let addedRepos = this.get('submission.repositories');
      let updatedRepos = Ember.A();
      addedRepos.forEach((repository) => {
        if (repositoryToRemove.get('id') !== repository.get('id')) {
          updatedRepos.pushObject(repository);
        }
      });
      this.set('submission.repositories', updatedRepos);
      this.get('workflow').setMaxStep(4);
    },
    toggleRepository(repository) {
      if (event.target.checked) {
        this.send('addRepository', repository);
      } else {
        this.send('removeRepository', repository);
      }
    },
    cancel() {
      this.sendAction('abort');
    }
  }
});
