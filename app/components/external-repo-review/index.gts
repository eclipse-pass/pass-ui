import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import ENV from 'pass-ui/config/environment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import swal from 'sweetalert2/dist/sweetalert2.js';
import type RepositoryModel from 'pass-ui/models/repository';

interface ExternalRepoReviewSignature {
  Args: {
    repos: RepositoryModel[];
    onAllExternalReposClicked: () => void;
  };
}

class VisitableRepo {
  @tracked visited: boolean;
  repo: RepositoryModel;

  constructor(repo: RepositoryModel, visited: boolean) {
    this.repo = repo;
    this.visited = visited;
  }
}

export default class ExternalRepoReviewComponent extends Component<ExternalRepoReviewSignature> {
  @tracked repoList: VisitableRepo[] = [];

  constructor(...args: any[]) {
    super(...args);
    this.repoList = this.args.repos.map((repo: RepositoryModel) => new VisitableRepo(repo, false));
  }

  get hasUnvisited(): boolean {
    return !this.allReposVisited;
  }

  get allReposVisited(): boolean {
    return this.repoList.every((entry) => entry.visited);
  }

  handleRepo(repo: RepositoryModel) {
    const index = this.repoList.findIndex((entry) => repo.id === entry.repo.id);
    this.repoList[index].visited = true;

    if (this.allReposVisited) {
      this.args.onAllExternalReposClicked();
    }
  }

  @action
  openWeblinkAlert(repo: RepositoryModel) {
    swal
      .fire({
        target: ENV.APP.rootElement,
        title: 'Notice!',
        text: 'You are being sent to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Open new tab',
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((value: any) => {
        if (value.dismiss) {
          return;
        }
        swal.close();
        const win = window.open(repo.url, '_blank');
        if (win) {
          win.focus();
        }
        this.handleRepo(repo);
      });
  }

  <template>
    <tr>
      <td class='text-nowrap text-center' id='externalSubmission'>
        <p class='{{if this.hasUnvisited "text-danger"}}'>
          External Submission Required
        </p>
        {{#if this.hasUnvisited}}
          <i class='fa fa-exclamation-triangle fa-2x notice-triangle text-danger'></i>
        {{/if}}
      </td>
      <td>
        <label>
          You are required to make a submission to these repositories directly because PASS cannot integrate with these
          systems.
        </label>
        <ul class='m-0 list-unstyled'>
          {{#each this.repoList as |entry|}}
            <li>
              <label class='pl-3 m-0 {{if entry.visited "" "font-weight-bold"}}'>
                {{entry.repo.name}}
                <button
                  type='button'
                  class='btn btn-link py-0 {{if entry.visited "" "font-weight-bold"}}'
                  data-test-repo-link-button
                  {{on 'click' (fn this.openWeblinkAlert entry.repo)}}
                >
                  {{entry.repo.url}}
                </button>
              </label>
            </li>
          {{/each}}
        </ul>
      </td>
    </tr>
  </template>
}
