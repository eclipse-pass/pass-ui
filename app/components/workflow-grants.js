import Component from '@ember/component';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

/**
 * This component is responsible for displaying a table of grants that are relevant to
 * the current submission. The list of grants is loaded here and is determined by
 * the "submitter" of the current submission.
 *
 * This step entirely determines the policies that may be applied to the submission,
 * which appear in a subsequent workflow step. Because of this, any change to selected
 * grants necessarily must change policies applied to the submission. Adding a grant
 * MUST trigger a recalculation of applied policies just as much as removing grants.
 * We can implement this by simply clearing `submission.effectivePolicies` every time we
 * make a change to grants in this stage. **We could also naively just clear
 * `effectivePolicies` every time we load into the Policies step...**
 */
export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),

  pageNumber: 1,
  pageCount: 0,
  pageSize: 10,
  submitterGrants: null,
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
    if (this.get('preLoadedGrant')) this.send('addGrant', this.get('preLoadedGrant'));
    if (this.get('submission.submitter.id')) this.updateGrants();
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
                  { term: { pi: this.get('submission.submitter.id') } },
                  { term: { coPis: this.get('submission.submitter.id') } }
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
      this.set('submitterGrants', results);
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
  filteredGrants: Ember.computed('submitterGrants', 'submission.grants.[]', function () {
    return this.get('submitterGrants').filter(g => !this.get('submission.grants').map(x => x.id).includes(g.get('id')));
  }),
  actions: {
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
      const workflow = this.get('workflow');
      const submission = this.get('submission');

      if (grant) {
        submission.get('grants').pushObject(grant);
        // submissionHandler.getRepositoriesFromGrant(grant).forEach(repo => workflow.addRepo(repo));
        workflow.addGrant(grant);
        workflow.setMaxStep(2);
      } else if (event && event.target.value) {
        this.get('store').findRecord('grant', event.target.value).then((g) => {
          g.get('primaryFunder.policy'); // Make sure policy is loaded in memory
          submission.get('grants').pushObject(g);
          workflow.addGrant(g);
          workflow.setMaxStep(2);
          Ember.$('select')[0].selectedIndex = 0;
        });
      }
    },
    async removeGrant(grant) {
      const workflow = this.get('workflow');

      // if grant is grant passed in from grant detail page remove query parms
      if (grant === this.get('preLoadedGrant')) {
        this.set('preLoadedGrant', null);
      }
      const submission = this.get('submission');
      submission.get('grants').removeObject(grant);

      workflow.removeGrant(grant);
      // undo progress, make user redo metadata step.
      workflow.setMaxStep(2);
    },

    abortSubmission() {
      this.sendAction('abort');
    }
  },
});
