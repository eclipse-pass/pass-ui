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
   * Updated way to populate the Grants table. Keys off of the logged in user,
   * instead of using the route/grant/index#model() in order to do server side
   * filtering of the visible Grants.
   *
   * Old way pulled in all Grants and did client side filtering.
   */
  tableModel: Ember.computed('currentUser.user', function () {
    const user = this.get('currentUser.user');

    if (!user) {
      return;
    }

    let results = [];
    // First search for all Grants associated with the current user
    this.get('store').query('grant', { match: { pi: user.get('id') } }).then((grants) => {
      let submissionQuery = { bool: { should: [] } };
      grants.forEach((grant) => {
        submissionQuery.bool.should.push({ match: { grants: grant.get('id') } });
        results.push({
          grant,
          submissions: Ember.A()
        });
      });

      // Then search for all Submissions associated with the returned Grants
      this.get('store').query('submission', submissionQuery).then((subs) => {
        subs.forEach((submission) => {
          submission.get('grants').forEach((grant) => {
            let match = results.find(res => res.grant.get('id') === grant.get('id'));
            if (match) {
              match.submissions.pushObject(submission);
            }
          });
        });
      }).then(() => results);
    });
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
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['Active', 'Ended'],
    },
    {
      propertyName: 'submissions.content.content.length',
      title: '#',
      disableFiltering: true,
      component: 'grant-link-cell'
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
