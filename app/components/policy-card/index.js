import Component from '@glimmer/component';
import { action, computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PolicyCard extends Component {
  @service workflow;

  @computed('workflow.pmcPublisherDeposit')
  get pmcPublisherDeposit() {
    return this.workflow.getPmcPublisherDeposit();
  }

  set pmcPublisherDeposit(value) {
    this.workflow.setPmcPublisherDeposit(value);
    return value;
  }

  @computed('workflow.maxStep')
  get maxStep() {
    return this.workflow.getMaxStep();
  }

  set maxStep(value) {
    this.workflow.setMaxStep(value);
    return value;
  }

  // checks if the radio buttons need to be displayed
  @computed('policy.repositories')
  get usesPmcRepository() {
    return this.args.policy.repositories
      ? this.args.policy.repositories.filter((repo) => repo.get('repositoryKey') === 'pmc').length > 0
      : false;
  }

  @computed('journal')
  get methodAJournal() {
    return get(this, 'args.journal.isMethodA');
  }

  @computed
  get policyIsJHU() {
    // eslint-ignore-line
    return this.args.policy.title === 'Johns Hopkins University (JHU) Open Access Policy';
  }

  /**
   * On render, add this policy to 'submission.effectivePolicies' unless it is a PMC repo
   * coupled with a Method A journal.
   */
  @action
  setup() {
    if (this.methodAJournal) {
      set(this, 'pmcPublisherDeposit', true);
    }

    if (!this.usesPmcRepository || !this.pmcPublisherDeposit) {
      this._addEffectivePolicy(this.args.policy);
    }
  }

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
  @action
  pmcPublisherDepositToggled(choice) {
    set(this, 'pmcPublisherDeposit', choice);
    set(this, 'maxStep', 3);

    const policy = this.args.policy;

    if (this._hasEffectivePolicy(policy.id)) {
      this._removeEffectivePolicy(policy);
    } else {
      this._addEffectivePolicy(policy);
    }
  }

  _addEffectivePolicy(policy) {
    // Only add the policy if it is not already in the list of effective policies
    if (!this._hasEffectivePolicy(policy.id)) {
      this.args.submission.effectivePolicies.pushObject(policy);
    }
  }

  _removeEffectivePolicy(policy) {
    this.args.submission.effectivePolicies.removeObject(policy);
  }

  _hasEffectivePolicy(policyId) {
    return this.args.submission.effectivePolicies && this.args.submission.effectivePolicies.isAny('id', policyId);
  }
}
