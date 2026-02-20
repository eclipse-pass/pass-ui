import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import didInsert from 'pass-ui/modifiers/did-insert';
import RepositoryCard from 'pass-ui/components/repository-card';
import ChoiceRepositoriesCard from 'pass-ui/components/choice-repositories-card';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type Workflow from 'pass-ui/services/workflow';
import type RepositoryModel from 'pass-ui/models/repository';
import type SubmissionModel from 'pass-ui/models/submission';
import type FunderModel from 'pass-ui/models/funder';

interface RepoInfo {
  repository: RepositoryModel;
  funders?: string;
}

interface WorkflowRepositoriesSignature {
  Args: {
    submission: SubmissionModel;
    requiredRepositories: RepoInfo[];
    optionalRepositories: RepoInfo[];
    choiceRepositories: RepoInfo[][];
    next: () => void;
    back: () => void;
    abort: () => void;
  };
  Blocks: {
    default: [];
  };
}

export default class WorkflowRepositories extends Component<WorkflowRepositoriesSignature> {
  @service declare submissionHandler: SubmissionHandlerService;
  @service declare workflow: Workflow;

  @tracked addedRepos: RepositoryModel[] = [];

  get requiredIntegratedRepos() {
    return this.args.requiredRepositories.filter((repoInfo: RepoInfo) => !repoInfo.repository._isWebLink);
  }

  get requiredWeblinkRepos() {
    return this.args.requiredRepositories.filter((repoInfo: RepoInfo) => repoInfo.repository._isWebLink);
  }

  @action
  setupRepos() {
    const args = this.args;
    this.addedRepos = this.getAddedRepositories();
    const currentRepos = args.submission.repositories;

    const opt = args.optionalRepositories;
    const req = args.requiredRepositories;
    const choice = args.choiceRepositories;

    if (currentRepos && currentRepos.length > 0) {
      const validRepos: string[] = [];

      req.forEach((repoInfo: RepoInfo) => {
        validRepos.push(repoInfo.repository.id!);
        this.addRepository(repoInfo.repository, false);
      });

      if (opt) {
        opt.forEach((optInfo: RepoInfo) => {
          validRepos.push(optInfo.repository.id!);
          this.setSelected(optInfo.repository);
        });
      }
      if (choice) {
        choice.forEach((group: RepoInfo[]) => {
          group.forEach((repoInfo: RepoInfo) => {
            validRepos.push(repoInfo.repository.id!);
            this.setSelected(repoInfo.repository);
          });
        });
      }

      currentRepos
        .filter((repo: RepositoryModel) => !validRepos.includes(repo.id!))
        .forEach(
          (repo: RepositoryModel) =>
            (args.submission.repositories = currentRepos.filter((r: RepositoryModel) => r.name === repo.name)),
        );
    } else {
      if (req) {
        req.forEach((repoInfo: RepoInfo) => this.addRepository(repoInfo.repository, false));
      }
      if (opt) {
        opt
          .filter((repoInfo: RepoInfo) => repoInfo.repository._selected)
          .forEach((repoInfo: RepoInfo) => this.addRepository(repoInfo.repository, false));
      }
      if (choice) {
        choice.forEach((group: RepoInfo[]) => {
          group
            .filter((repoInfo: RepoInfo) => repoInfo.repository._selected)
            .forEach((repoInfo: RepoInfo) => this.addRepository(repoInfo.repository, false));
        });
      }
    }
  }

  getAddedRepositories() {
    const grants = this.workflow.getAddedGrants();
    return this.submissionHandler.getRepositoriesFromGrants(grants);
  }

  setSelected(repo: RepositoryModel) {
    const id = repo.id;
    const addedRepos = this.addedRepos;
    const currentRepos = this.args.submission.repositories;

    if (addedRepos.some((r: RepositoryModel) => r.id === id)) {
      return;
    }

    repo._selected = currentRepos.some((r: RepositoryModel) => r.id === id);
  }

  @action
  toggleRepository(repository: RepositoryModel, selected: boolean, _type: string) {
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

  addRepository(repository: RepositoryModel, setMaxStep: boolean) {
    const repos = this.args.submission.repositories;

    if (!repos.includes(repository)) {
      this.args.submission.repositories = [repository, ...repos];
    }
    if (setMaxStep) {
      this.workflow.setMaxStep(4);
    }
  }

  removeRepository(repository: RepositoryModel, setMaxStep: boolean) {
    const repositories = this.args.submission.repositories;
    this.args.submission.repositories = repositories.filter((r: RepositoryModel) => r.name !== repository.name);
    if (setMaxStep) {
      this.workflow.setMaxStep(4);
    }
  }

  <template>
    <div {{didInsert this.setupRepos}}></div>
    {{#if @requiredRepositories}}
      <h3 class='mt-3 font-weight-light' data-test-workflow-repositories-required>
        Required repositories
      </h3>
      <p class='lead text-muted'>
        Based on the grant and journal information provided, you are required to submit your manuscript to the
        repositories below. PASS will help you to create submissions for these in the following steps:
      </p>
      <ul class='list-group' data-test-workflow-repositories-required-list>
        {{#each this.requiredIntegratedRepos as |repoInfo|}}
          <RepositoryCard @repository={{repoInfo.repository}} @funders={{repoInfo.funders}} @type='required' />
        {{/each}}
      </ul>

      {{#if this.requiredWeblinkRepos.length}}
        <p class='lead text-muted mt-3'>
          You are required to submit to the following repositories, but PASS cannot make them for you. PASS can provide
          links to these repositories with a summary of the information you've entered for your PASS submission before
          finalizing the submission. You will need to follow those links in order to make a submission in those separate
          repository systems.
        </p>
        <ul class='list-group' data-test-workflow-repositories-required-weblink-list>
          {{#each this.requiredWeblinkRepos as |repoInfo|}}
            <RepositoryCard @repository={{repoInfo.repository}} @funders={{repoInfo.funders}} @type='required' />
          {{/each}}
        </ul>
      {{/if}}
    {{/if}}

    {{#if @choiceRepositories}}
      <p class='lead text-muted'>
        Based on the grant and journal information provided, you can choose between the repositories below. You must
        submit to at least one repository from each group.
      </p>
      {{#each @choiceRepositories as |repoGroup|}}
        <ChoiceRepositoriesCard @choiceGroup={{repoGroup}} @toggleRepository={{this.toggleRepository}} />
      {{/each}}
    {{/if}}

    {{#if @optionalRepositories}}
      <h4 class='mt-3 font-weight-light'>
        Optional repositories
      </h4>
      <p class='lead text-muted'>
        Choose whether you want to submit to zero or more of the following repositories. Selecting the repositories
        below is optional.
      </p>
      <div id='local-deposit-list'>
        <ul class='list-group' data-test-workflow-repositories-optional-list>
          {{#each @optionalRepositories as |repoInfo|}}
            <RepositoryCard
              @repository={{repoInfo.repository}}
              @funders={{repoInfo.funders}}
              @choice='true'
              @type='optional'
              @toggleRepository={{this.toggleRepository}}
            />
          {{/each}}
        </ul>
      </div>
    {{/if}}

    {{yield}}

    <button type='button' class='btn btn-outline-primary mt-3' {{on 'click' this.back}}>
      Back
    </button>
    <button type='button' class='btn btn-outline-danger ml-2 mt-3' {{on 'click' this.cancel}}>
      Cancel
    </button>
    <button
      type='button'
      class='btn btn-primary next pull-right mt-3'
      data-test-workflow-repositories-next
      {{on 'click' this.next}}
    >
      Next
    </button>
  </template>
}
