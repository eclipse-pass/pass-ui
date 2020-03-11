import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),

  pmcPublisherDeposit: computed('workflow.pmcPublisherDeposit', {
    get(key) {
      return this.get('workflow').getPmcPublisherDeposit();
    },
    set(key, value) {
      this.get('workflow').setPmcPublisherDeposit(value);
      return value;
    }
  }),
  maxStep: computed('workflow.maxStep', {
    get(key) {
      return this.get('workflow').getMaxStep();
    },
    set(key, value) {
      this.get('workflow').setMaxStep(value);
      return value;
    }
  }),
  // checks if the radio buttons need to be displayed
  usesPmcRepository: computed('policy.repositories', function () {
    return this.get('policy.repositories') ? (this.get('policy.repositories').filter(repo => repo.get('repositoryKey') === 'pmc').length > 0) : false;
  }),
  methodAJournal: computed('journal', function () {
    return this.get('journal.isMethodA');
  }),
  policyIsJHU: computed(function () { // eslint-ignore-line
    return this.get('policy.title') === 'Johns Hopkins University (JHU) Open Access Policy';
  }),

  /**
   * On render, add this policy to 'submission.effectivePolicies' unless it is a PMC repo
   * coupled with a Method A journal.
   */
  didRender() {
    this._super(...arguments);
    if (this.get('methodAJournal')) {
      this.set('pmcPublisherDeposit', true);
    }

    if (!this.get('usesPmcRepository') || !this.get('pmcPublisherDeposit')) {
      this._addEffectivePolicy(this.get('policy'));
    }
  },
  actions: {
    /**
     * Toggles whether or not the user claims the publication is taken care of
     * by the publisher. If TRUE, PASS is not responsible for ensuring policy
     * compliance.
     *
     * Add or remove the policy in 'submission.effectivePolicies'
     *
     * IMPL NOTE: This action sets the 'pmcPublisherDeposit' status in the
     * 'workflow' service. The 'workflow' service can be accessed in other
     * submission workflow steps to get this information back. This is done
     * to avoid having to bubble an event up the stack (I guess).
     *
     * @param {boolean} choice
     */
    pmcPublisherDepositToggled(choice) {
      this.set('pmcPublisherDeposit', choice);
      this.set('maxStep', 3);

      const policy = this.get('policy');

      if (this._hasEffectivePolicy(policy.get('id'))) {
        this._removeEffectivePolicy(policy);
      } else {
        this._addEffectivePolicy(policy);
      }
    }
  },

  _addEffectivePolicy(policy) {
    // Only add the policy if it is not already in the list of effective policies
    if (!this._hasEffectivePolicy(policy.get('id'))) {
      this.get('submission.effectivePolicies').pushObject(policy);
    }
  },

  _removeEffectivePolicy(policy) {
    this.get('submission.effectivePolicies').removeObject(policy);
  },

  _hasEffectivePolicy(policyId) {
    return this.get('submission.effectivePolicies') &&
      this.get('submission.effectivePolicies').isAny('id', policyId);
  }
});
