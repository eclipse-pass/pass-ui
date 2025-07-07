/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * This component is responsible for displaying a table of grants that are relevant to
 * the current submission. The list of grants is loaded here and is determined by
 * the "submitter" of the current submission.
 *
 *
 */
export default class WorkflowGrants extends Component {
  @service store;
  @service workflow;
  @service appStaticConfig;
  @service('emt-themes/bootstrap4') themeInstance;

  @tracked contactUrl = null;
  @tracked workflowStep = 2;

  @tracked pageNumber = 1;
  @tracked pageCount = 0;
  @tracked pageSize = 10;
  @tracked submitterGrants = null;
  @tracked totalGrants = 0;
  /** Grants already attached to the submission on component init */
  @tracked _selectedGrants = [];
  @tracked preLoadedGrant = this.args.preLoadedGrant;
  @tracked grantColumns = [
    {
      propertyName: 'awardNumber',
      title: 'Award Number',
      className: 'awardnum-column',
      component: 'grantLinkNewtabCell',
      disableSorting: true,
    },
    {
      title: 'Project name (funding period)',
      className: 'projectname-date-column',
      component: 'grantTitleDateCell',
      disableSorting: true,
    },
    {
      propertyName: 'primaryFunder.name',
      title: 'Funder',
      className: 'funder-column',
      disableSorting: true,
    },
    {
      title: 'Select',
      component: 'selectRowToggle',
      mayBeHidden: false,
    },
  ];

  // Matches numbered starting at 1. Return number of first match on current page.
  get pageFirstMatchNumber() {
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  // Matches numbered starting at 1. Return number of last match on current page.
  get pageLastMatchNumber() {
    let result = this.pageNumber * this.pageSize;
    let total = this.totalGrants;

    if (result > total) {
      result = total;
    }

    return result;
  }

  get filteredGrants() {
    return this.submitterGrants.filter(
      (g) =>
        !get(this, 'submission.grants')
          .map((x) => x.id)
          .includes(g.get('id')),
    );
  }

  @action
  setWorkflowStepHere() {
    this.workflow.setMaxStep(this.workflowStep);
  }

  @task
  setup = function* () {
    this.contactUrl = this.appStaticConfig?.config?.branding?.pages?.contactUrl;

    const submitter = yield this.args.submission.submitter;
    if (submitter?.id) {
      yield this.updateGrants.perform();
    }

    // Init selected grants to grants already attached to submission

    this._selectedGrants = [];
    let grants = yield this.args.submission.grants;
    if (this.preLoadedGrant) {
      grants = [this.preLoadedGrant, ...grants];
      this.workflow.addGrant(this.preLoadedGrant);
    }
    this._selectedGrants = [...grants];
  };

  updateGrants = task(async () => {
    const userId = await this.args.submission.submitter.id;
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '-endDate',
      page: {
        number: this.pageNumber,
        size: this.pageSize,
        totals: true,
      },
    };
    const results = await this.store.query('grant', grantQuery).then((data) => ({
      grants: data,
      page: data.meta.page,
    }));
    this.submitterGrants = results.grants;
    this.totalGrants = results.page.totalRecords;
    this.pageCount = results.page.totalPages;
  });

  /**
   * Only really triggered on #init by a pre-loaded grant...
   *
   * @param {Grant} grant
   * @param {object} event ?
   */
  @task
  initialAddGrant = function* (grant, event) {
    if (grant) {
      this.addGrant(grant);
    } else if (event && event.target.value) {
      let grant = yield this.store.findRecord('grant', event.target.value);

      grant.get('primaryFunder.policy'); // Make sure policy is loaded in memory
      this.addGrant(grant);
      document.querySelectorAll('select')[0].selectedIndex = 0;
    }
  };

  @action
  prevPage() {
    let i = this.pageNumber;

    if (i > 1) {
      set(this, 'pageNumber', i - 1);
      this.updateGrants.perform();
    }
  }

  @action
  nextPage() {
    let i = this.pageNumber;

    if (i < this.pageCount) {
      set(this, 'pageNumber', i + 1);
      this.updateGrants.perform();
    }
  }

  /**
   * Add a grant to the submission. Since this effects subsequent steps in the workflow,
   * make sure the user can't skip any step past this
   *
   * @param {Grant} grant
   */
  @action
  async addGrant(grant) {
    const workflow = this.workflow;
    const submission = this.args.submission;
    let grants = await submission.grants;

    if (!grants.includes(grant)) {
      this.args.submission.grants = [grant, ...grants];
    }
    if (!workflow.getAddedGrants().includes(grant)) {
      workflow.addGrant(grant);
    }
    if (!this._selectedGrants.includes(grant)) {
      this._selectedGrants = [grant, ...this._selectedGrants];
    }

    this.setWorkflowStepHere();
  }

  /**
   * Remove a grant from the submission. If the grant was "pre-loaded" in the submission
   * workflow, make sure it is no longer marked that way (remove grant ID from URL param).
   * Since this effects subsequent steps, force the user to go through all steps again
   * to recalculate things like `effectivePolicies` and `repositories`
   *
   * @param {Grant} grant
   */
  @action
  async removeGrant(grant) {
    const workflow = this.workflow;

    // if grant is grant passed in from grant detail page remove query parms
    if (grant === this.preLoadedGrant) {
      this.preLoadedGrant = null;
    }
    const submission = this.args.submission;
    const grants = await submission.grants;
    this.args.submission.grants = grants.filter((g) => g !== grant);
    workflow.removeGrant(grant);
    this._selectedGrants = this._selectedGrants.filter((g) => g !== grant);

    this.setWorkflowStepHere();
  }

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
  @action
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
    const previousSelection = this._selectedGrants;

    const curLen = get(selectedItems, 'length');
    const prevLen = get(previousSelection, 'length');

    if (curLen > prevLen) {
      /**
       * Grant added. For each currently selected grant, check if it is
       * present in the previous selection state. If not, make sure it is
       * added everywhere appropriate.
       */
      selectedItems.filter((grant) => !previousSelection.includes(grant)).forEach((grant) => this.addGrant(grant));
    } else if (curLen < prevLen) {
      /**
       * Grant removed. For each previously selected grant, check if it is
       * present in current selection. If not, make sure it is removed where
       * appropriate.
       */
      previousSelection.filter((grant) => !selectedItems.includes(grant)).forEach((grant) => this.removeGrant(grant));
    } else if (curLen === 1 && prevLen === 1) {
      this.addGrant(selectedItems[0]);

      return;
    } else if (curLen === 0 && prevLen === 1) {
      this.removeGrant(selectedItems[0]);
    }
  }

  @action
  abortSubmission() {
    this.args.abort();
  }
}
