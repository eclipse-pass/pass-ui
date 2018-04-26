import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { computed } from '@ember/object';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  // Bound to message dialog.
  messageShow: false,
  messageTo: '',
  messageSubject: '',
  messageText: '',

  actions: {
    authorclick(submission) {
      this.set('messageShow', true);
      this.set('messageTo', submission.get('user.displayName'));
      this.set('messageSubject', 'OAP Compliance');
      this.set('messageText', `Concerning submission ${submission.get('title')}, the status is ${submission.get('status')}.\nPlease check your PASS dashboard.`);
    },
  },

  // Columns displayed depend on the user role
  columns: computed('currentUser', {
    get() {
      if (this.get('currentUser.user.role') === 'ADMIN') {
        return this.get('adminColumns');
      } else if (this.get('currentUser.user.role') === 'PI') {
        return this.get('piColumns');
      }
      return [];
    },
  }),

  piColumns: [
    { propertyName: 'publication', title: 'Article', component: 'submissions-article-cell' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'user', title: 'Corr. Author', component: 'submissions-author-cell' },
    { propertyName: 'repositories', title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'userSubmittedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'userSubmittedDate', title: 'Submitted Date', component: 'date-cell' },
    {
      propertyName: 'status',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete'],
    },
    { propertyName: 'deposits', title: 'OAP Repo Id', component: 'submissions-repoid-cell' },
  ],

  adminColumns: [
    { propertyName: 'publication', title: 'Article', component: 'submissions-article-cell' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'user', title: 'Corr. Author', component: 'submissions-author-cell' },
    { propertyName: 'repositories', title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'userSubmittedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'userSubmittedDate', title: 'Submitted Date', component: 'date-cell' },
    {
      propertyName: 'status',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete'],
    },
    { propertyName: 'deposits', title: 'OAP Repo Id', component: 'submissions-repoid-cell' },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
