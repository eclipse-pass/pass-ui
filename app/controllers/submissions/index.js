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

  tablePageSize: 50,
  tablePageSizeValues: [10, 25, 50],

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
    className: 'title-column',
    title: 'Article',
    component: 'submissions-article-cell'
  },
  {
    title: 'Award Number (Funder)',
    propertyName: 'grantInfo',
    className: 'awardnum-funder-column',
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
    className: 'msid-column',
    title: 'Manuscript IDs',
    component: 'submissions-repoid-cell',
    disableSorting: true
  },
  {
    title: 'Actions',
    className: 'actions-column',
    component: 'submission-action-cell'
  }
  ],

  adminColumns: [{
    propertyName: 'publication',
    title: 'Article',
    component: 'submissions-article-cell'
  },
  {
    title: 'Award Number (Funder)',
    className: 'awardnum-funder-column',
    component: 'submissions-award-cell'
  },
  {
    propertyName: 'repositories',
    title: 'Repositories',
    component: 'submissions-repo-cell'
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
    title: 'Manuscript IDs',
    component: 'submissions-repoid-cell'
  },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
