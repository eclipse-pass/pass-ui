import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'agency', title: 'Agency' },
    { propertyName: 'number', title: 'Number' },
    { propertyName: 'title', title: 'Title' },
    { propertyName: 'creator.username', title: 'Creator' },    
    { propertyName: 'startDate', title: 'Start date' },
    { propertyName: 'endDate', title: 'End date' },
    { component: "grants-action-cell", title: 'Actions' }
  ],

  themeInstance: Bootstrap4Theme.create()  
});
