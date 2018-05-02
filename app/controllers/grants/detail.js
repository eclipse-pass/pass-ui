import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),

  columns: [
    { propertyName: 'publication', title: 'Article', component: 'submissions-article-cell' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'user', title: 'Corr. Author', component: 'submissions-author-cell' },
    { propertyName: 'repositories', title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'userSubmittedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'userSubmittedDate', title: 'Submitted Date', component: 'date-cell' },
    {
      propertyName: 'awardStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete'],
    },
    { propertyName: 'deposits', title: 'OAP Repo Id', component: 'submissions-repoid-cell' },
  ],
  //
  themeInstance: Bootstrap4Theme.create(),
});
