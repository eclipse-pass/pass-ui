import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { computed } from '@ember/object';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  // Bound to message dialog.
  messageShow: false,
  messageTo: '',
  messageSubject: '',
  messageText: '',

  actions: {
    piclick(grant) {
      this.set('messageShow', true);
      this.set('messageTo', grant.get('pi.displayName'));
      this.set('messageSubject', 'OAP Compliance');

      let text = `Concerning project ${grant.get('projectName')}, one or more of the following submissions have issues:`;
      grant.get('submissions').forEach((s) => {
        text += `\n  Article: ${s.get('title')}, Status: ${s.get('awardStatus')}`;
      });
      text += '\n\nPlease check your PASS dashboard.';

      this.set('messageText', text);
    },
  },

  tablePageSize: 5,
  tablePageSizeValues: [5, 10, 25],

  // Columns displayed depend on the user role
  columns: computed('currentUser', {
    get() {
      const userRoles = this.get('currentUser.user.roles');
      if (userRoles.includes('admin')) {
        return this.get('adminColumns');
      } else if (userRoles.includes('submitter')) {
        return this.get('piColumns');
      }
      return [];
    },
  }),

  // TODO Reduce duplication in column definitions

  adminColumns: [
    {
      propertyName: 'projectName',
      title: 'Project Name'
    },
    {
      propertyName: 'primaryFunder.name',
      title: 'Funder',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'awardNumber',
      title: 'Award Number',
      routeName: 'grants.detail',
      disableFiltering: true,
    },
    {
      propertyName: 'localKey',
      title: 'COEUS',
      disableFiltering: true,
    },
    {
      title: 'PI / CO-PIs',
      propertyName: 'pi',
      component: 'pi-list-cell'
    },
    {
      propertyName: 'startDate',
      title: 'Start',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'endDate',
      title: 'End',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'awardStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['Active', 'Ended'],
    },
    {
      propertyName: 'submissions.length', title: '#', routeName: 'grants.detail', disableFiltering: true,
    },
    {
      propertyName: 'oapCompliance',
      title: 'OAP Compliance',
      component: 'oap-compliance-cell',
      filterWithSelect: true,
      predefinedFilterOptions: ['No', 'Yes'],
    },
  ],

  piColumns: [
    {
      propertyName: 'projectName',
      title: 'Project Name'
    },
    {
      propertyName: 'primaryFunder.name',
      title: 'Funder',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'awardNumber',
      title: 'Award Number',
      routeName: 'grants.detail',
      disableFiltering: true,
    },
    {
      propertyName: 'localKey',
      title: 'COEUS',
      disableFiltering: true,
    },
    {
      title: 'PI',
      propertyName: 'pi',
      component: 'pi-list-cell'
    },
    {
      propertyName: 'startDate',
      title: 'Start',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'endDate',
      title: 'End',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'submissions.length', title: '#', routeName: 'grants.detail', disableFiltering: true,
    },
    {
      propertyName: 'awardStatus',
      title: 'Status',
      filterWithSelect: true,
    },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
