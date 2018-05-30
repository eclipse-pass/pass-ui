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
    // PI/coPI Emailing on click - feature removed for release
    // authorclick(submission) {
    //   this.set('messageShow', true);
    //   this.set('messageTo', submission.get('user.displayName'));
    //   this.set('messageSubject', 'OAP Compliance');
    //   this.set('messageText', `Concerning submission ${submission.get('title')}, the status is ${submission.get('aggregatedDepositStatus')}.\nPlease check your PASS dashboard.`);
    // },
  },

  // Columns displayed depend on the user role
  columns: computed('currentUser', {
    get() {
      if (this.get('currentUser.user.isAdmin')) {
        return this.get('adminColumns');
      } else if (this.get('currentUser.user.isSubmitter')) {
        return this.get('piColumns');
      }
      return [];
    },
  }),

  piColumns: [{
    propertyName: 'publicationTitle',
    title: 'Article',
    component: 'submissions-article-cell'
  },
  {
    title: 'Award Number (Funder)',
    propertyName: 'grantInfo',
    component: 'submissions-award-cell',
    disableSorting: true
  },
  {
    propertyName: 'repositoryNames',
    title: 'Repositories',
    component: 'submissions-repo-cell',
    disableSorting: true
  },
  {
    propertyName: 'submittedDate',
    title: 'Last Update Date',
    component: 'date-cell'
  },
  {
    propertyName: 'submittedDate',
    title: 'Submitted Date',
    component: 'date-cell'
  },
  {
    propertyName: 'aggregatedDepositStatus',
    title: 'Status',
    filterWithSelect: true,
    predefinedFilterOptions: ['In Progress', 'Complete'],
    component: 'submission-status-cell'
  },
  {
    propertyName: 'repoCopies',
    title: 'Manuscript ID',
    component: 'submissions-repoid-cell',
    disableSorting: true
  },
  ],

  adminColumns: [{
    propertyName: 'publication',
    title: 'Article',
    component: 'submissions-article-cell'
  },
  {
    title: 'Award Number (Funder)',
    component: 'submissions-award-cell'
  },
  {
    propertyName: 'repositories',
    title: 'Repositories',
    component: 'submissions-repo-cell'
  },
  {
    propertyName: 'submittedDate',
    title: 'Last Update Date',
    component: 'date-cell'
  },
  {
    propertyName: 'submittedDate',
    title: 'Submitted Date',
    component: 'date-cell'
  },
  {
    propertyName: 'aggregatedDepositStatus',
    title: 'Status',
    filterWithSelect: true,
    predefinedFilterOptions: ['In Progress', 'Complete'],
  },
  {
    // propertyName: 'repoCopies',
    title: 'Manuscript ID',
    component: 'submissions-repoid-cell'
  },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
