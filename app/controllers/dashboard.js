import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'number', title: 'Number' },
    { propertyName: 'title', title: 'Title' },
    { propertyName: 'start_date', title: 'Start date' },
    { propertyName: 'end_date', title: 'End date' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
