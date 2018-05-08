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

  /**
   * Crappy way to attach search results to a grant in the table
   */
  tableModel: Ember.computed('model.grants', function () {
    const grants = this.get('model.grants');
    let result = [];

    grants.forEach((grant) => {
      result.push({
        grant,
        submissions: this.get('store').query('submission', { term: { grants: grant.get('id') } })
      });
    });

    return result;
  }),

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
      propertyName: 'grant.projectName',
      title: 'Project Name',
      routeName: 'grants.detail',
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Funder',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Award Number',
      routeName: 'grants.detail',
      disableFiltering: true,
    },
    {
      propertyName: 'grant.localKey',
      title: 'COEUS',
      disableFiltering: true,
    },
    {
      title: 'PI',
      propertyName: 'grant.pi',
      component: 'pi-list-cell'
    },
    {
      propertyName: 'grant.startDate',
      title: 'Start',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'grant.endDate',
      title: 'End',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['Active', 'Ended'],
    },
    {
      title: '#', disableFiltering: true, component: 'grant-sub-number-cell'
    },
    {
      propertyName: 'grant.oapCompliance',
      title: 'OAP Compliance',
      component: 'oap-compliance-cell',
      filterWithSelect: true,
      predefinedFilterOptions: ['No', 'Yes'],
    },
  ],

  piColumns: [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      routeName: 'grants.detail',
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Funder',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Award Number',
      disableFiltering: true,
      component: 'grant-link-cell'
    },
    {
      propertyName: 'grant.localKey',
      title: 'COEUS',
      disableFiltering: true,
    },
    {
      title: 'PI',
      propertyName: 'grant.pi',
      component: 'pi-list-cell'
    },
    {
      propertyName: 'grant.startDate',
      title: 'Start',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'grant.endDate',
      title: 'End',
      disableFiltering: true,
      component: 'date-cell'
    },
    {
      propertyName: 'submissions.content.content.length',
      title: '#',
      disableFiltering: true,
      component: 'grant-link-cell'
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
    },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
