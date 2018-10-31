import Component from '@ember/component';
import ENV from '../config/environment';

export default Component.extend({
  store: Ember.inject.service('store'),
  currentUser: Ember.inject.service('current-user'),
  searchInput: '',
  users: [],
  page: 0,
  pageSize: 50,
  totalResults: 0,
  totalPages: Ember.computed('totalResults', 'pageSize', function () {
    return Math.ceil(this.get('totalResults') / this.get('pageSize'));
  }),
  pages: Ember.computed('page', 'pageSize', 'totalResults', 'totalPages', function () {
    let arr = [];
    for (let i = 1; i <= this.get('totalPages') + 1; i += 1) {
      arr.push(i);
    }
  }),
  filteredUsers: Ember.computed('users', function () {
    return this.get('users').filter(u => u.id !== this.get('currentUser.user.id'));
  }),
  previousDisabled: Ember.computed('page', function () {
    return this.get('page') <= 0;
  }),
  nextDisabled: Ember.computed('page', function () {
    return this.get('page') >= this.get('totalPages');
  }),
  actions: {
    toggleModal() {
      this.toggleProperty('isShowingModal');
    },
    searchForUsers(page) {
      if (page === null || page === undefined || !page) {
        page = 1;
      }
      this.set('page', page);
      const size = this.get('pageSize');
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
        this.set('users', users);
        if (info.total !== null) this.set('totalResults', info.total);
      });
    },
    async pickSubmitter(submitter) {
      if (this.get('model.newSubmission.submitter.id') && this.get('model.newSubmission.grants.length') > 0) {
        let result = await swal({
          type: 'warning',
          title: 'Are you sure?',
          html: 'Picking a new submitter will also <strong>remove all grants</strong> attached to your submission as a security measure. <strong>Any relevant grants will still be able to be re-added.</strong> Are you sure you want to proceed?',
          showCancelButton: true,
          cancelButtonText: 'Nevermind',
          confirmButtonText: 'Yes, I\'m sure'
        });
        if (result.value) {
          this.set('model.newSubmission.grants', Ember.A());
          toastr.info('All grants removed from submission.');
        }
      }
      this.set('searchInput', '');
      this.set('submitterEmail', '');
      this.set('submitterName', '');
      this.set('model.newSubmission.submitter', submitter);
      this.set('isShowingModal', false);
    }
  }
});
