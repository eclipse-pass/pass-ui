import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/modifier';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import RepositoryCard from 'pass-ui/components/repository-card';
import ChoiceRepositoriesCard from 'pass-ui/components/choice-repositories-card';

export default class WorkflowRepositories extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare submissionHandler: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked addedRepos: any[] = [];

  get requiredIntegratedRepos() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.args as any).requiredRepositories.filter((repoInfo: any) => !repoInfo.repository._isWebLink);
  }

  get requiredWeblinkRepos() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.args as any).requiredRepositories.filter((repoInfo: any) => repoInfo.repository._isWebLink);
  }

  @action
  async setupRepos() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args = this.args as any;
    this.addedRepos = this.getAddedRepositories();
    const currentRepos = await args.submission.repositories;

    const opt = await args.optionalRepositories;
    const req = await args.requiredRepositories;
    const choice = await args.choiceRepositories;

    if (currentRepos && currentRepos.length > 0) {
      const validRepos: string[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.forEach((repoInfo: any) => {
        validRepos.push(repoInfo.repository.id);
        this.addRepository(repoInfo.repository, false);
      });

      if (opt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opt.forEach((optInfo: any) => {
          validRepos.push(optInfo.repository.id);
          this.setSelected(optInfo.repository);
        });
      }
      if (choice) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        choice.forEach((group: any[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          group.forEach((repoInfo: any) => {
            validRepos.push(repoInfo.repository.id);
            this.setSelected(repoInfo.repository);
          });
        });
      }

      currentRepos
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((repo: any) => !validRepos.includes(repo.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .forEach((repo: any) => (args.submission.repositories = currentRepos.filter((r: any) => r.name === repo.name)));
    } else {
      if (req) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.forEach((repoInfo: any) => this.addRepository(repoInfo.repository, false));
      }
      if (opt) {
        opt
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((repoInfo: any) => repoInfo.repository._selected)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .forEach((repoInfo: any) => this.addRepository(repoInfo.repository, false));
      }
      if (choice) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        choice.forEach((group: any[]) => {
          group
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((repoInfo: any) => repoInfo.repository._selected)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .forEach((repoInfo: any) => this.addRepository(repoInfo.repository, false));
        });
      }
    }
  }

  getAddedRepositories() {
    const grants = this.workflow.getAddedGrants();
    return this.submissionHandler.getRepositoriesFromGrants(grants);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setSelected(repo: any) {
    const id = repo.id;
    const addedRepos = this.addedRepos;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentRepos = await (this.args as any).submission.repositories;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (addedRepos.some((r: any) => r.id === id)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repo._selected = currentRepos.some((r: any) => r.id === id);
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleRepository(repository: any, selected: boolean, _type: string) {
    if (selected) {
      this.addRepository(repository, true);
    } else {
      this.removeRepository(repository, true);
    }
  }

  @action
  cancel() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).abort();
  }

  @action
  next() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).next();
  }

  @action
  back() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).back();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addRepository(repository: any, setMaxStep: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repos = await (this.args as any).submission.repositories;

    if (!repos.includes(repository)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.args as any).submission.repositories = [repository, ...repos];
    }
    if (setMaxStep) {
      this.workflow.setMaxStep(4);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async removeRepository(repository: any, setMaxStep: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repositories = await (this.args as any).submission.repositories;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).submission.repositories = repositories.filter((r: any) => r.name !== repository.name);
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
