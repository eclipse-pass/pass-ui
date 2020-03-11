import { computed } from '@ember/object';
import Component from '@ember/component';
import ENV from '../config/environment';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  currentUser: service('current-user'),
  matchingUsers: [],
  currentPage: 1,
  usersPerPage: 30,
  numberOfMatches: 0,
  numberOfPages: computed('numberOfMatches', 'usersPerPage', function () {
    return Math.ceil(this.get('numberOfMatches') / this.get('usersPerPage'));
  }),
  pageNumbers: computed('numberOfPages', function () {
    let arr = [];
    for (let i = 1; i <= this.get('numberOfPages'); i += 1) {
      arr.push(i);
    }
    return arr;
  }),
  moreThanOnePage: computed('numberOfPages', function () {
    return (this.get('numberOfPages') ? (this.get('numberOfPages') > 1) : false);
  }),
  filteredUsers: computed('matchingUsers', 'currentUser.user.id', function () {
    let users = this.get('matchingUsers');
    return users.filter(u => u.id !== this.get('currentUser.user.id'));
  }),
  init() {
    this._super(...arguments);
    if (this.get('searchInput')) {
      this.send('searchForUsers', 1);
    }
  },
  actions: {
    searchForUsers(page) {
      if (page === 0 || page === null || page === undefined || !page) {
        page = 1;
      }
      this.set('currentPage', page);
      const size = this.get('usersPerPage');
      let info = {};
      let input = this.get('searchInput');
      this.get('store').query('user', {
        query: {
          bool: {
            filter: {
              exists: { field: 'email' }
            },
            should: {
              multi_match: { query: input, fields: ['firstName', 'middleName', 'lastName', 'email', 'displayName'] }
            },
            minimum_should_match: 1
          }
        },
        from: (page - 1) * size,
        size,
        info
      }).then((users) => {
        this.set('matchingUsers', users);
        if (info.total !== null) this.set('numberOfMatches', info.total);
      });
    }
  }
});
