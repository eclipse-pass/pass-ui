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

  didRender() {
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
       * as well as any other repositories marked as 'selected'
       */
      this.get('requiredRepositories').forEach(repoInfo => this.addRepository(repoInfo));
      this.get('optionalRepositories').filter(repoInfo => repoInfo.selected)
        .forEach(repoInfo => this.addRepository(repoInfo));
      this.get('choiceRepositories').forEach((group) => {
        group.filter(repoInfo => repoInfo.selected).forEach(repoInfo => this.addRepository(repoInfo));
      });
    }
  },

  actions: {
    /**
     * Toggle a repository on/off of this submission
     *
     * @param {object} repoInfo {
     *    repository: {}, // Ember model object
     *    selected: true|false
     *    repository-id: ''
     * }
     */
    toggleRepository(repoInfo) {
      const checked = event.target.checked;
      repoInfo.selected = checked;
      if (checked) {
        this.addRepository(repoInfo);
      } else {
        this.removeRepository(repoInfo);
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
   * @param {object} repoInfo {
   *    repository: {}, // Ember model object
   *    selected: true|false
   *    repository-id: ''
   * }
   */
  addRepository(repoInfo) {
    const repository = repoInfo.repository;
    const subRepos = this.get('submission.repositories');

    if (!subRepos.includes(repository)) {
      subRepos.pushObject(repository);
    }
    this.get('workflow').setMaxStep(4);
  },

  /**
   * Remove a repository from the submission
   *
   * @param {object} repoInfo {
   *    repository: {}, // Ember model object
   *    selected: true|false
   *    repository-id: ''
   * }
   */
  removeRepository(repoInfo) {
    const repositoryToRemove = repoInfo.repository;

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
});
