import $ from 'jquery';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

/**
 * This component is responsible for displaying a table of grants that are relevant to
 * the current submission. The list of grants is loaded here and is determined by
 * the "submitter" of the current submission.
 *
 *
 */
export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  configurator: service('app-static-config'),

  assetsUri: null,

  workflowStep: 2,

  pageNumber: 1,
  pageCount: 0,
  pageSize: 10,
  submitterGrants: null,
  totalGrants: 0,
  themeInstance: Bootstrap4Theme.create(),

  /** Grants already attached to the submission on component init */
  _selectedGrants: A(),

  // Matches numbered starting at 1. Return number of first match on current page.
  pageFirstMatchNumber: computed('totalGrants', 'pageNumber', 'pageSize', function () {
    return ((this.get('pageNumber') - 1) * this.get('pageSize')) + 1;
  }),

  // Matches numbered starting at 1. Return number of last match on current page.
  pageLastMatchNumber: computed('totalGrants', 'pageNumber', 'pageSize', function () {
    let result = this.get('pageNumber') * this.get('pageSize');
    let total = this.get('totalGrants');

    if (result > total) {
      result = total;
    }

    return result;
  }),
  init() {
    this._super(...arguments);

    this.get('configurator').getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));

    if (this.get('preLoadedGrant')) {
      this.send('addGrant', this.get('preLoadedGrant'));
    }
    if (this.get('submission.submitter.id')) {
      this.updateGrants();
    }

    // Init selected grants to grants already attached to submission
    this.get('_selectedGrants').clear();
    this.get('_selectedGrants').addObjects(this.get('submission.grants'));
  },

  setWorkflowStepHere() {
    this.get('workflow').setMaxStep(this.get('workflowStep'));
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
  filteredGrants: computed('submitterGrants', 'submission.grants.[]', function () {
    return this.get('submitterGrants').filter(g => !this.get('submission.grants').map(x => x.id).includes(g.get('id')));
  }),

  /**
   * Add a grant to the submission. Since this effects subsequent steps in the workflow,
   * make sure the user can't skip any step past this
   *
   * @param {Grant} grant
   */
  addGrant(grant) {
    const workflow = this.get('workflow');
    const submission = this.get('submission');

    if (!submission.get('grants').includes(grant)) {
      submission.get('grants').pushObject(grant);
    }
    if (!workflow.getAddedGrants().includes(grant)) {
      workflow.addGrant(grant);
    }
    if (!this.get('_selectedGrants').includes(grant)) {
      this.get('_selectedGrants').pushObject(grant);
    }

    this.setWorkflowStepHere();
  },

  /**
   * Remove a grant from the submission. If the grant was "pre-loaded" in the submission
   * workflow, make sure it is no longer marked that way (remove grant ID from URL param).
   * Since this effects subsequent steps, force the user to go through all steps again
   * to recalculate things like `effectivePolicies` and `repositories`
   *
   * @param {Grant} grant
   */
  removeGrant(grant) {
    const workflow = this.get('workflow');

    // if grant is grant passed in from grant detail page remove query parms
    if (grant === this.get('preLoadedGrant')) {
      this.set('preLoadedGrant', null);
    }
    const submission = this.get('submission');
    submission.get('grants').removeObject(grant);
    workflow.removeGrant(grant);
    this.get('_selectedGrants').removeObject(grant);

    this.setWorkflowStepHere();
  },

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

    /**
     * Only really triggered on #init by a pre-loaded grant...
     *
     * @param {Grant} grant
     * @param {object} event ?
     */
    addGrant(grant, event) {
      if (grant) {
        this.addGrant(grant);
      } else if (event && event.target.value) {
        this.get('store').findRecord('grant', event.target.value).then((g) => {
          g.get('primaryFunder.policy'); // Make sure policy is loaded in memory
          this.addGrant(g);
          $('select')[0].selectedIndex = 0;
        });
      }
    },

    /**
     * Only triggered by clicking the Remove button in the "Current Selection" table
     *
     * @param {Grant} grant
     */
    async removeGrant(grant) {
      this.removeGrant(grant);
    },

    /**
     * Since this action is only triggered from user interaction, we can be sure that
     * any Grants found selected (or deselected) in this action are not the result of
     * the previous state of the Submission. These grants should be tracked in 'workflow'
     *
     * This action catches user interactions that don't directly trigger #addGrant or
     * #removeGrant actions. These actions _will_ add or remove grants, just not through
     * the above actions. We need to know when this happens so we can track the Grants
     * in the workflow.
     */
    dataChange(options) {
      const selectedItems = options.selectedItems;

      /**
       * Compare `selectedItems` with `_selectedGrants`, which holds the previous
       * selection of grants. If these two differ, we know that some selection
       * has been made (though we don't know if it was an addition or removal).
       * This will weed out other display data changes, like table filtering.
       *
       * When we know grant selection has changed, we have to make sure all places
       * that Grants are tracked are updated (_selectedGrants, workflow.addedGrants,
       * and submission.grants). Also reset progress in the workflow, forcing
       * users to step through the workflow, without skipping steps.
       */
      const previousSelection = this.get('_selectedGrants');

      const curLen = selectedItems.get('length');
      const prevLen = previousSelection.get('length');

      if (curLen > prevLen) {
        /**
         * Grant added. For each currently selected grant, check if it is
         * present in the previous selection state. If not, make sure it is
         * added everywhere appropriate.
         */
        selectedItems.filter(grant => !previousSelection.includes(grant))
          .forEach(grant => this.addGrant(grant));
      } else if (curLen < prevLen) {
        /**
         * Grant removed. For each previously selected grant, check if it is
         * present in current selection. If not, make sure it is removed where
         * appropriate.
         */
        previousSelection.filter(grant => !selectedItems.includes(grant))
          .forEach(grant => this.removeGrant(grant));
      }

      this.set('_selectedGrants', selectedItems);
    },

    abortSubmission() {
      this.sendAction('abort');
    }
  },
});
