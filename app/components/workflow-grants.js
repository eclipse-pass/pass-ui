import WorkflowComponent from './workflow-component';
import { Promise, } from 'rsvp';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default WorkflowComponent.extend({
  store: service('store'),
  pageNumber: 1,
  pageCount: 0,
  pageSize: 10,
  grants: null,
  totalGrants: 0,
  themeInstance: Bootstrap4Theme.create(),

  // Matches numbered starting at 1. Return number of first match on current page.
  pageFirstMatchNumber: Ember.computed('totalGrants', 'pageNumber', 'pageSize', function () {
    return ((this.get('pageNumber') - 1) * this.get('pageSize')) + 1;
  }),

  // Matches numbered starting at 1. Return number of last match on current page.
  pageLastMatchNumber: Ember.computed('totalGrants', 'pageNumber', 'pageSize', function () {
    let result = this.get('pageNumber') * this.get('pageSize');
    let total = this.get('totalGrants');

    if (result > total) {
      result = total;
    }

    return result;
  }),
  init() {
    this._super(...arguments);
    if (this.get('model.preLoadedGrant')) this.send('addGrant', this.get('model.preLoadedGrant'));
    if (this.get('model.newSubmission.submitter.id')) this.updateGrants();
  },
  updateGrants() {
    let info = {};

    this.get('store').query('grant', {
      query: {
        bool: {
          must: [
            { range: { endDate: { gte: '2011-01-01' } } },
            {
              bool: {
                should: [
                  { term: { pi: this.get('model.newSubmission.submitter.id') } },
                  { term: { coPis: this.get('model.newSubmission.submitter.id') } }
                ]
              }
            }
          ]
        }
      },
      from: (this.get('pageNumber') - 1) * this.get('pageSize'),
      size: this.get('pageSize'),
      sort: [{ endDate: 'desc' }],
      info
    }).then((results) => {
      this.set('grants', results);
      this.set('totalGrants', info.total);
      this.set('pageCount', Math.ceil(info.total / this.get('pageSize')));
    });
  },
  grantColumns: [
    {
      propertyName: 'awardNumber',
      title: 'Award Number',
      className: 'awardnum-column',
      component: 'grant-link-newtab-cell',
      disableSorting: true,
    },
    {
      title: 'Project name (funding period)',
      className: 'projectname-date-column',
      component: 'grant-title-date-cell',
      disableSorting: true
    },
    {
      propertyName: 'primaryFunder.name',
      title: 'Funder',
      className: 'funder-column',
      disableSorting: true
    },
    {
      component: 'select-row-toggle',
      mayBeHidden: false
    }
  ],
  filteredGrants: Ember.computed('grants', 'model.newSubmission.grants.[]', function () {
    return this.get('grants').filter(g => !this.get('model.newSubmission.grants').map(x => x.id).includes(g.get('id')));
  }),
  actions: {
    next() {
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    prevPage() {
      let i = this.get('pageNumber');

      if (i > 1) {
        this.set('pageNumber', i - 1);
        this.updateGrants();
      }
    },
    nextPage() {
      let i = this.get('pageNumber');

      if (i < this.get('pageCount')) {
        this.set('pageNumber', i + 1);
        this.updateGrants();
      }
    },
    addGrant(grant, event) {
      if (grant) {
        const submission = this.get('model.newSubmission');
        submission.get('grants').pushObject(grant);
        this.set('maxStep', 2);
      } else if (event && event.target.value) {
        this.get('store').findRecord('grant', event.target.value).then((g) => {
          g.get('primaryFunder.policy'); // Make sure policy is loaded in memory
          const submission = this.get('model.newSubmission');
          submission.get('grants').pushObject(g);
          this.set('maxStep', 2);
          Ember.$('select')[0].selectedIndex = 0;
        });
      }
    },
    async removeGrant(grant) {
      // if grant is grant passed in from grant detail page remove query parms
      if (grant === this.get('model.preLoadedGrant')) {
        this.set('model.preLoadedGrant', null);
      }
      const submission = this.get('model.newSubmission');
      submission.get('grants').removeObject(grant);

      // undo progress, make user redo metadata step.
      this.set('maxStep', 2);
    },
  },
});
