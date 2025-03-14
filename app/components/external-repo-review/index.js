import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';

class VisitableRepo {
  @tracked visited;
  repo;

  constructor(repo, visited) {
    this.repo = repo;
    this.visited = visited;
  }
}

/**
 * Assume:
 *    - User must click link for all repos passed into this component
 * args:
 *    repos: array<Repository>
 *    onAllExternalReposClicked: function - Action to trigger when all external repositories have been clicked
 */
export default class ExternalRepoReviewComponent extends Component {
  @tracked repoList;

  constructor() {
    super(...arguments);
    this.repoList = this.args.repos.map((repo) => new VisitableRepo(repo, false));
  }

  get hasUnvisited() {
    return !this.allReposVisited;
  }

  get allReposVisited() {
    return this.repoList.every((entry) => entry.visited);
  }

  handleRepo(repo) {
    const index = this.repoList.findIndex((entry) => repo.id === entry.repo.id);
    this.repoList[index].visited = true;

    if (this.allReposVisited) {
      this.args.onAllExternalReposClicked();
    }
  }

  @action
  openWeblinkAlert(repo) {
    swal
      .fire({
        target: ENV.APP.rootElement,
        title: 'Notice!',
        text: 'You are being sent to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Open new tab',
      })
      .then((value) => {
        if (value.dismiss) {
          return; // Don't redirect
        }
        $('#externalSubmission').modal('hide');
        const win = window.open(repo.url, '_blank');
        if (win) {
          win.focus();
        }
        this.handleRepo(repo);
      });
  }
}
