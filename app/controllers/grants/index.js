import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'agency', title: 'Agency' },
    { propertyName: 'number', title: 'Number' },
    { propertyName: 'title', title: 'Title' },
    { propertyName: 'creator.username', title: 'Creator' },    
    { propertyName: 'start_date', title: 'Start date' },
    { propertyName: 'end_date', title: 'End date' },
    { component: "grants-action-cell", title: 'Actions' }
  ],

  themeInstance: Bootstrap4Theme.create()  
});
