/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class WorkflowBasicsUserSearch extends Component {
  @service store;
  @service currentUser;

  @tracked matchingUsers = [];
  @tracked currentPage = 1;
  @tracked usersPerPage = 30;
  @tracked numberOfPages = 1;

  get pageNumbers() {
    let arr = [];
    for (let i = 1; i <= this.numberOfPages; i += 1) {
      arr.push(i);
    }
    return arr;
  }

  get moreThanOnePage() {
    return this.numberOfPages ? this.numberOfPages > 1 : false;
  }

  get filteredUsers() {
    let users = this.matchingUsers;
    return users.filter((u) => u.id !== get(this, 'currentUser.user.id'));
  }

  constructor() {
    super(...arguments);

    if (this.args.searchInput) {
      this.searchForUsers.perform(1);
    }
  }

  userFilter(input) {
    const match = `=ini="*${input}*"`;
    return [`firstName${match}`, `middleName${match}`, `lastName${match}`, `email${match}`, `displayName${match}`].join(
      ','
    );
  }

  @task
  searchForUsers = function* (page) {
    // Strip out non-alphanumberic characters to ensure filter is valid
    // Such characters in the middle of the string become a space
    let input = this.args.searchInput.replace(/\W+/g, ' ').trim();

    if (input.length == 0) {
      return;
    }

    if (page === 0 || page === null || page === undefined || !page) {
      page = 1;
    }

    this.currentPage = page;

    const size = this.usersPerPage;

    const query = {
      filter: {
        user: `email=isnull=false;(${this.userFilter(input)})`,
      },
      page: {
        number: page,
        size: size,
        totals: null,
      },
    };

    let users = yield this.store.query('user', query);

    if (users.meta) {
      this.numberOfPages = users.meta.page.totalPages;
    }

    this.matchingUsers = users;
  };
}
