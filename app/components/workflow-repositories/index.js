/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

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
 * "required", "optional", and "choice groups" are arrays of objects that look like:
 *  repoInfo: {
 *    funders: '', // string
 *    repository: {}, // Repository object
 *  }
 */
export default class WorkflowRepositories extends Component {
  @service submissionHandler;
  @service workflow;

  @tracked addedRepos = A([]);

  // Separate out repositories that PASS has some level of integration
  get requiredIntegratedRepos() {
    return this.args.requiredRepositories.filter((repoInfo) => !repoInfo.repository._isWebLink);
  }

  // Separate out repositories that PASS has no integration
  get requiredWeblinkRepos() {
    return this.args.requiredRepositories.filter((repoInfo) => repoInfo.repository._isWebLink);
  }

  /**
   * On component `did-insert`, make sure repositories in submission object
   * are valid
   */
  @action
  setupRepos() {
    set(this, 'addedRepos', this.getAddedRepositories());
    const currentRepos = get(this, 'submission.repositories');

    const opt = this.args.optionalRepositories;
    const req = this.args.requiredRepositories;
    const choice = this.args.choiceRepositories;

    if (currentRepos && currentRepos.length > 0) {
      /**
       * Since this is used to tell if a repo is present in the policy service result, we don't care
       * if there are duplicates
       */
      const validRepos = [];

      /**
       * Make sure any required repos have been added to the submission
       */
      req.forEach((repoInfo) => {
        validRepos.push(repoInfo.repository.id);
        this.addRepository(repoInfo.repository, false);
      });

      /**
       * Check returned repositories against any repositories already set in the current submission.
       * Make sure all repositories present in the submission have `selected: true` in the returned
       * lists.
       */
      if (opt) {
        opt.forEach((opt) => {
          validRepos.push(opt.repository.id);
          this.setSelected(opt.repository);
        });
      }
      if (choice) {
        choice.forEach((group) => {
          group.forEach((repoInfo) => {
            validRepos.push(repoInfo.repository.id);
            this.setSelected(repoInfo.repository);
          });
        });
      }

      /**
       * Remove any extra repositories that do not appear in any of the repo lists.
       * There may be a case of a repository appearing in the submission's repo list
       * that is not present in the response from the Policy service. This repository
       * should be considered invalid and removed from the submission prior to any
       * other operation.
       *
       * Use IDs instead of full Repository objects to try to avoid weird JS equality
       * nonsense.
       */
      currentRepos.filter((repo) => !validRepos.includes(repo.id)).forEach((repo) => currentRepos.removeObject(repo));
    } else {
      /**
       * If no repositories have been saved to the submission yet, force add all required repositories
       * as well as any other repositories marked as 'selected'
       */
      if (req) {
        req.forEach((repoInfo) => this.addRepository(repoInfo.repository, false));
      }
      if (opt) {
        opt
          .filter((repoInfo) => get(repoInfo, 'repository._selected'))
          .forEach((repoInfo) => this.addRepository(repoInfo.repository, false));
      }
      if (choice) {
        choice.forEach((group) => {
          group
            .filter((repoInfo) => get(repoInfo, 'repository._selected'))
            .forEach((repoInfo) => this.addRepository(repoInfo.repository, false));
        });
      }
    }
  }

  getAddedRepositories() {
    const grants = this.workflow.getAddedGrants();
    return this.submissionHandler.getRepositoriesFromGrants(grants);
  }

  /**
   * Set the selection status of an "optional" repository.
   *
   * The default selection status should be kept if the repository was added during this pass through
   * the submission workflow, which is "known" in the workflow service. If the repository wasn't just
   * added, then the repository's selection status should be set according to its presence in the
   * submission's repositories list.
   *
   * @param {Repository} repo the repository that may be modified
   */
  setSelected(repo) {
    const id = repo.id;
    const addedRepos = this.addedRepos;
    const currentRepos = get(this, 'args.submission.repositories');

    if (addedRepos.isAny('id', id)) {
      return;
    }

    repo.set('_selected', currentRepos.isAny('id', id));
  }

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
  @action
  toggleRepository(repository, selected, type) {
    if (selected) {
      this.addRepository(repository, true);
    } else {
      this.removeRepository(repository, true);
    }
  }

  @action
  cancel() {
    this.args.abort();
  }

  @action
  next() {
    this.args.next();
  }

  @action
  back() {
    this.args.back();
  }

  /**
   * Add a repository to the submission only if it is not already included
   *
   * @param {Repository} repository
   * @param {boolean} setMaxStep should we modify 'maxStep' in the workflow?
   */
  addRepository(repository, setMaxStep) {
    const subRepos = get(this, 'args.submission.repositories');

    if (!subRepos.includes(repository)) {
      subRepos.pushObject(repository);
    }
    if (setMaxStep) {
      this.workflow.setMaxStep(4);
    }
  }

  /**
   * Remove a repository from the submission
   *
   * @param {Repository} repository
   * @param {boolean} setMaxStep should we modify 'maxStep' in the workflow?
   */
  removeRepository(repository, setMaxStep) {
    get(this, 'args.submission.repositories').removeObject(repository);
    if (setMaxStep) {
      this.workflow.setMaxStep(4);
    }
  }
}
