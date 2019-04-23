import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),
  pmcPublisherDeposit: Ember.computed('workflow.pmcPublisherDeposit', {
    get(key) {
      return this.get('workflow').getPmcPublisherDeposit();
    },
    set(key, value) {
      this.get('workflow').setPmcPublisherDeposit(value);
      return value;
    }
  }),
  maxStep: Ember.computed('workflow.maxStep', {
    get(key) {
      return this.get('workflow').getMaxStep();
    },
    set(key, value) {
      this.get('workflow').setMaxStep(value);
      return value;
    }
  }),
  // checks if the radio buttons need to be displayed
  usesPmcRepository: Ember.computed('policy.repositories', function () {
    return this.get('policy.repositories') ? (this.get('policy.repositories').filter(repo => repo.get('repositoryKey') === 'pmc').length > 0) : false;
  }),
  methodAJournal: Ember.computed('journal', function () {
    return this.get('journal.isMethodA');
  }),
  policyIsJHU: Ember.computed(function () { // eslint-ignore-line
    return this.get('policy.title') === 'Johns Hopkins University (JHU) Open Access Policy';
  }),
  didRender() {
    this._super(...arguments);
    if (this.get('methodAJournal')) {
      this.set('pmcPublisherDeposit', true);
    }
  },
  actions: {
    /**
     * Toggles whether or not the user claims the publication is taken care of
     * by the publisher. If TRUE, PASS is not responsible for ensuring policy
     * compliance.
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
    }
  }
});
