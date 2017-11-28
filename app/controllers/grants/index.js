import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'projectName', title: 'Project Name' },
    { propertyName: 'funder.name', title: 'Funder' },
    { propertyName: 'awardNumber', title: 'Award Number' , routeName: 'grants.show'},
    { propertyName: 'externalId', title: 'COEUS Id', component: 'identifier-cell' },
    { title: 'PI / CO-PIs', component: 'pi-list-cell' },
    { propertyName: 'startDate', title: 'Start Date', component: 'date-cell'},
    { propertyName: 'endDate', title: 'End Date', component: 'date-cell'},
    { propertyName: 'submissions.length', title: 'Submissions', routeName: 'grants.show'},
    { propertyName: 'status', title: 'Status' },
    { propertyName: 'oapCompliance', title: 'OAP Compliance' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
