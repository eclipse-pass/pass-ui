import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  columns: [
    { propertyName: 'publication', title: 'Article', component: 'submissions-article-cell' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'repositories', title: 'Repositories', component: 'submissions-repo-cell' },
    { propertyName: 'submittedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    {
      propertyName: 'aggregatedDepositStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete'],
    },
    { propertyName: 'deposits', title: 'Ext. Repo Id', component: 'submissions-repoid-cell' },
  ],
  //
  themeInstance: Bootstrap4Theme.create(),
});
