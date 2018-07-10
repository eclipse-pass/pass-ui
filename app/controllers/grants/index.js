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

  tablePageSize: 50,
  tablePageSizeValues: [10, 25, 50],

  // Columns displayed depend on the user role
  columns: computed('currentUser', {
    get() {
      const user = this.get('currentUser.user');
      if (user.get('isSubmitter')) {
        return this.get('submitterColumns');
      } else if (user.get('isAdmin')) {
        return this.get('adminColumns');
      }
      return [];
    },
  }),

  commonColumns: [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      component: 'grant-link-cell'
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Funder',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Award #',
      className: 'awardnum-column',
      disableFiltering: true,
      component: 'grant-link-cell'
    },
    {
      propertyName: 'grant.endDate',
      title: 'End Date',
      disableFiltering: true,
      className: 'date-column',
      component: 'date-cell'
    },
    {
      propertyName: 'submissions.length',
      title: '# of Submissions',
      disableFiltering: true,
      component: 'grant-submission-cell'
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
    },
    {
      propertyName: 'grant.oapCompliance',
      title: 'Policy Compliance',
      component: 'oap-compliance-cell',
    },
  ],

  adminColumns() {
    return this.get('commonColumns');
  },

  submitterColumns() {
    let cols = this.get('commonColumns');
    cols.push({
      title: 'Actions',
      component: 'grant-action-cell'
    });
    return cols;
  },

  themeInstance: Bootstrap4Theme.create(),
});
