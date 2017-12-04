import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'title', title: 'Article' },
    { propertyName: '', title: 'Award Number (Funder)' },
    { propertyName: 'author', title: 'Corr. Author' },
    { propertyName: 'repo', title: 'Repo' },
    { propertyName: 'updatedDate', title: 'Last Update Date' },
    { propertyName: 'submittedDate', title: 'Submitted Date' },
    { propertyName: 'status', title: 'Status' },
    { propertyName: 'creator.username', title: 'OAP Repo Id' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
