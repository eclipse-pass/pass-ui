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
 */
export default Component.extend({
  workflow: service('workflow'),

  willRender() {
    this._super(...arguments);

    const currentRepos = this.get('submission.repositories');

    const opt = this.get('optionalRepositories');
    const req = this.get('requiredRepositories');
    const choice = this.get('choiceRepositories');

    if (currentRepos && currentRepos.length > 0) {
      /**
       * Check returned repositories against any repositories already set in the current submission.
       * Make sure all repositories present in the submission have `selected: true` in the returned
       * lists.
       */
      if (opt) {
        opt.forEach((opt) => { opt.repository.set('_selected', currentRepos.includes(opt.repository)); });
      }
      if (choice) {
        choice.forEach((group) => {
          group.forEach((repoInfo) => {
            repoInfo.repository.set('_selected', currentRepos.includes(repoInfo.repository));
          });
        });
      }
    } else {
      /**
       * If no repositories have been saved to the submission yet, force add all required repositories
       * as well as any other repositories marked as 'selected'
       */
      if (req) {
        req.forEach(repoInfo => this.addRepository(repoInfo.repository, false));
      }
      if (opt) {
        opt.filter(repoInfo => repoInfo.repository.get('_selected'))
          .forEach(repoInfo => this.addRepository(repoInfo.repository, false));
      }
      if (choice) {
        choice.forEach((group) => {
          group.filter(repoInfo => repoInfo.repository.get('_selected'))
            .forEach(repoInfo => this.addRepository(repoInfo.repository, false));
        });
      }
    }
  },

  actions: {
    /**
     * Toggle a repository on/off of this submission.
     *
     * NOTE:
     * Normally, we would have to make sure that there is at least one repository from
     * each "choice group" selected.
     * Do not worry about checking things for "choice" groups, since that logic is done
     * in the 'choice-repositories-card' component. That component will only bubble the
     * toggle action to here if such an action is logically possible.
     *
     * @param {Repository} repository
     * @param {boolean} selected - has the repo been selected or deselected?
     *    TRUE = repo was selected, FALSE = repo was deselected
     * @param {string} type required|optional|choice
     */
    toggleRepository(repository, selected, type) {
      if (selected) {
        this.addRepository(repository);
      } else {
        this.removeRepository(repository);
      }
    },

    cancel() {
      this.sendAction('abort');
    },

    next() {
      this.sendAction('next');
    },

    back() {
      this.sendAction('back');
    }
  },

  /**
   * Add a repository to the submission only if it is not already included
   *
   * @param {Repository} repository
   * @param {boolean} setMaxStep should we modify 'maxStep' in the workflow?
   */
  addRepository(repository, setMaxStep) {
    const subRepos = this.get('submission.repositories');

    if (!subRepos.includes(repository)) {
      subRepos.pushObject(repository);
    }
    if (setMaxStep) {
      this.get('workflow').setMaxStep(4);
    }
  },

  /**
   * Remove a repository from the submission
   *
   * @param {Repository} repository
   * @param {boolean} setMaxStep should we modify 'maxStep' in the workflow?
   */
  removeRepository(repository, setMaxStep) {
    this.get('submission.repositories').removeObject(repository);
    if (setMaxStep) {
      this.get('workflow').setMaxStep(4);
    }
  },
});
