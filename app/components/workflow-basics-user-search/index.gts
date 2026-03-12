import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { Input } from '@ember/component';
import { query } from 'pass-ui/builders/pass-api';
import type CurrentUserService from 'pass-ui/services/current-user';
import type UserModel from 'pass-ui/models/user';
import type AppStore from 'pass-ui/services/store';

const eq = (a: unknown, b: unknown) => a === b;

const perform =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (task: any, ...curried: any[]) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) =>
      task.perform(...curried, ...args);

interface WorkflowBasicsUserSearchSignature {
  Args: {
    searchInput: string;
    toggleUserSearchModal: () => void;
    pickSubmitter: (user: UserModel) => void;
  };
}

export default class WorkflowBasicsUserSearch extends Component<WorkflowBasicsUserSearchSignature> {
  @service declare store: AppStore;
  @service declare currentUser: CurrentUserService;

  @tracked matchingUsers: UserModel[] = [];
  @tracked currentPage = 1;
  @tracked usersPerPage = 30;
  @tracked numberOfPages = 1;

  get pageNumbers(): number[] {
    const arr = [];
    for (let i = 1; i <= this.numberOfPages; i += 1) {
      arr.push(i);
    }
    return arr;
  }

  get moreThanOnePage(): boolean {
    return this.numberOfPages ? this.numberOfPages > 1 : false;
  }

  get filteredUsers() {
    const users = this.matchingUsers;
    return users.filter((u: UserModel) => u.id !== this.currentUser.user?.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(owner: any, args: WorkflowBasicsUserSearchSignature['Args']) {
    super(owner, args);

    if (this.args.searchInput) {
      this.searchForUsers.perform(1);
    }
  }

  userFilter(input: string): string {
    const match = `=ini="*${input}*"`;
    return [`firstName${match}`, `middleName${match}`, `lastName${match}`, `email${match}`, `displayName${match}`].join(
      ',',
    );
  }

  @action
  handleEnterSearch(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchForUsers.perform(1);
    }
  }

  searchForUsers = task(async (page: number) => {
    const input = this.args.searchInput.replace(/\W+/g, ' ').trim();

    if (input.length == 0) {
      return;
    }

    if (page === 0 || page === null || page === undefined || !page) {
      page = 1;
    }

    this.currentPage = page;

    const size = this.usersPerPage;

    const queryHash = {
      filter: {
        user: `email=isnull=false;(${this.userFilter(input)})`,
      },
      page: {
        number: page,
        size: size,
        totals: null,
      },
    };

    const { content } = await this.store.request(query('user', queryHash));
    const doc = content as { data: UserModel[]; meta?: { page: { totalPages: number } } };
    const users = doc.data;

    if (doc.meta) {
      this.numberOfPages = doc.meta.page.totalPages;
    }

    this.matchingUsers = users;
  });

  <template>
    {{! template-lint-disable link-href-attributes require-button-type require-input-label }}
    <div class='user-search-container p-4'>
      <button
        class='btn btn-outline-primary close-button'
        type='button'
        {{on 'click' @toggleUserSearchModal}}
      >X</button>
      <div class='container'>
        <h2>Search Users</h2>
        <p class='text-muted'>Search by name or email and click on a user to assign them to the submitter role.</p>
        <div class='input-group pb-3'>
          <Input @value={{@searchInput}} {{on 'keydown' this.handleEnterSearch}} class='form-control' />
          <span class='input-group-btn'>
            <button
              id='search-for-users'
              class='btn btn-primary'
              {{on 'click' (perform this.searchForUsers 1)}}
              type='button'
            >Search</button>
          </span>
        </div>
        <h3 class='my-4'>Results</h3>
        {{#if this.filteredUsers}}
          <div class='row user-search-results'>
            {{#each this.filteredUsers as |user|}}
              <div class='col-6'>
                <a href='#' {{on 'click' (fn @pickSubmitter user)}} data-test-found-proxy-user>
                  {{user.firstName}}
                  {{user.lastName}}
                  {{#if user.email}}({{user.email}}){{/if}}
                </a>
              </div>
            {{/each}}
          </div>
        {{else}}
          <p>No results found.</p>
        {{/if}}
        {{#if this.moreThanOnePage}}
          <ul class='pagination mt-4 mx-auto mb-0 pb-0'>
            {{#each this.pageNumbers as |p|}}
              {{#if (eq p this.currentPage)}}
                <li class='active'><a>{{p}}</a></li>
              {{else}}
                <li><a href='#' {{on 'click' (perform this.searchForUsers p)}}>{{p}}</a></li>
              {{/if}}
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </div>
  </template>
}
