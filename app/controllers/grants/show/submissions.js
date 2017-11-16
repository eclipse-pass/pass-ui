import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'title', title: 'Title' },
    { propertyName: 'status', title: 'Status' },
    { propertyName: 'creationDate', title: 'Created' },
    { component: "submissions-action-cell", title: 'Actions' }
  ],

  themeInstance: Bootstrap4Theme.create()  
});
