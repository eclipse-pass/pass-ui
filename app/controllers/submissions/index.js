import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service('current-user'),
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
        return [
          {
            propertyName: 'publication',
            title: 'Article',
            className: 'title-column',
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
            className: 'repositories-column',
            component: 'submissions-repo-cell'
          },
          {
            propertyName: 'submittedDate',
            title: 'Submitted Date',
            className: 'date-column',
            component: 'date-cell'
          },
          {
            propertyName: 'submissionStatus',
            title: 'Status',
            className: 'status-column',
            component: 'submissions-status-cell'
          },
          {
            // propertyName: 'repoCopies',
            title: 'Manuscript IDs',
            className: 'msid-column',
            component: 'submissions-repoid-cell'
          }
        ];
      } else if (this.get('currentUser.user.isSubmitter')) {
        return [
          {
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
            className: 'repositories-column',
            disableSorting: true
          },
          {
            propertyName: 'submittedDate',
            title: 'Submitted Date',
            className: 'date-column',
            component: 'date-cell'
          },
          {
            propertyName: 'submissionStatus',
            title: 'Status',
            className: 'status-column',
            component: 'submissions-status-cell'
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
        ];
      } else { // eslint-disable-line
        return [];
      }
    }
  }),

  themeInstance: Bootstrap4Theme.create(),
});
