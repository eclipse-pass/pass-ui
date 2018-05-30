import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  columns: [
    {
      propertyName: 'publicationTitle',
      title: 'Article',
      component: 'submissions-article-cell'
    },
    {
      propertyName: 'grantInfo',
      title: 'Award Number (Funder)',
      component: 'submissions-award-cell',
      disableSorting: true
    },
    {
      propertyName: 'repositorieNames',
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
  //
  themeInstance: Bootstrap4Theme.create(),
});
