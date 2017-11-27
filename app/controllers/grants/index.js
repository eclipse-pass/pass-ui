import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  columns: [
    { propertyName: 'projectName', title: 'Project Name' },
    { propertyName: 'funder.name', title: 'Funder' },
    { propertyName: 'awardNumber', title: 'Award Number' , routeName: 'grants.show'},
    { propertyName: 'externalId.label', title: 'COEUS Id' },
    { propertyName: 'pi.name', title: 'PI / CO-PIs' },
    { propertyName: 'startDate', title: 'Start' },
    { propertyName: 'endDate', title: 'End' },
    { propertyName: 'submissions.length', title: 'Submissions', routeName: 'grants.show'},
    { propertyName: 'status', title: 'Status' },
    { propertyName: 'oapCompliance', title: 'OAP Compliance' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
