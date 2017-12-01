import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { computed } from '@ember/object';

export default Controller.extend({
  // Bound to message dialog.
  messageShow: false,
  messageTo: '',
  messageSubject: '',
  messageText: '',

  actions: {
    piclick(grant) {
      this.set('messageShow', true);
      this.set('messageTo', grant.get('pi.name'));
      this.set('messageSubject', 'OAP Compliance')
      this.set('messageText', grant.get('projectName'));
    }
  },

  // Columns displayed depend on the user role
  columns: computed('session.user', {
    get() {
      if (this.get('session.isAdmin')) {
            return this.get('adminColumns');
      } else if (this.get('session.isPI')) {
            return this.get('piColumns');
      } else {
        return [];
      }
    }
  }),

  adminColumns: [
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

  piColumns: [
    { propertyName: 'projectName', title: 'Project Name' },
    { propertyName: 'funder.name', title: 'Funder' },
    { propertyName: 'awardNumber', title: 'Award Number' , routeName: 'grants.show'},
    { propertyName: 'externalId', title: 'COEUS Id', component: 'identifier-cell' },
    { title: 'PI / CO-PIs', component: 'pi-list-cell' },
    { propertyName: 'startDate', title: 'Start Date', component: 'date-cell'},
    { propertyName: 'endDate', title: 'End Date', component: 'date-cell'},
    { propertyName: 'submissions.length', title: 'Submissions', routeName: 'grants.show'},
    { propertyName: 'status', title: 'Status' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
