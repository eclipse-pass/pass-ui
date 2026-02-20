import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import didInsert from 'pass-ui/modifiers/did-insert';
import type Workflow from 'pass-ui/services/workflow';
import type PolicyModel from 'pass-ui/models/policy';
import type SubmissionModel from 'pass-ui/models/submission';
import type JournalModel from 'pass-ui/models/journal';
import type RepositoryModel from 'pass-ui/models/repository';

const not = (a: unknown) => !a;

interface PolicyCardSignature {
  Args: {
    policy: PolicyModel;
    submission: SubmissionModel;
    journal: JournalModel | null;
  };
}

export default class PolicyCard extends Component<PolicyCardSignature> {
  @service declare workflow: Workflow;

  get pmcPublisherDeposit(): boolean {
    return this.workflow.getPmcPublisherDeposit();
  }

  set pmcPublisherDeposit(value: boolean) {
    this.workflow.setPmcPublisherDeposit(value);
  }

  get maxStep(): number {
    return this.workflow.getMaxStep();
  }

  set maxStep(value: number) {
    this.workflow.setMaxStep(value);
  }

  get usesPmcRepository(): boolean {
    const repos = this.args.policy.repositories;
    return repos ? repos.filter((repo: RepositoryModel) => repo.repositoryKey === 'pmc').length > 0 : false;
  }

  get methodAJournal(): boolean {
    const journal = this.args.journal;
    return journal?.isMethodA ?? false;
  }

  get policyIsJHU(): boolean {
    return this.args.policy.title === 'Johns Hopkins University (JHU) Open Access Policy';
  }

  @action
  setup() {
    if (this.methodAJournal) {
      this.pmcPublisherDeposit = true;
    }

    if (!this.usesPmcRepository || !this.pmcPublisherDeposit) {
      this._addEffectivePolicy(this.args.policy);
    }
  }

  @action
  pmcPublisherDepositToggled(choice: boolean) {
    this.pmcPublisherDeposit = choice;
    this.maxStep = 3;

    const policy = this.args.policy;

    if (this._hasEffectivePolicy(policy.id!)) {
      this._removeEffectivePolicy(policy);
    } else {
      this._addEffectivePolicy(policy);
    }
  }

  _addEffectivePolicy(policy: PolicyModel) {
    const effectivePolicies = this.args.submission.effectivePolicies;
    const hasEffectivePolicy = this._hasEffectivePolicy(policy.id!);
    if (!hasEffectivePolicy) {
      this.args.submission.effectivePolicies = [...effectivePolicies, policy];
    }
  }

  _removeEffectivePolicy(policy: PolicyModel) {
    const effectivePolicies = this.args.submission.effectivePolicies;
    this.args.submission.effectivePolicies = effectivePolicies.filter((p: PolicyModel) => p.id !== policy.id);
  }

  _hasEffectivePolicy(policyId: string) {
    const effectivePolicies = this.args.submission.effectivePolicies;
    return !!effectivePolicies && effectivePolicies.some((policy: PolicyModel) => policy.id === policyId);
  }

  <template>
    {{! template-lint-disable link-rel-noopener no-triple-curlies require-input-label }}
    <div class='card w-100 my-2' {{didInsert this.setup}}>
      <div class='card-body'>
        <h3 class='card-title' data-test-policy-title>
          {{@policy.title}}
        </h3>
        {{#if this.policyIsJHU}}
          <h6 class='card-subtitle mb-2' data-test-jhu-policy-deposit-expectation>
            Expects deposit into an open access repository
          </h6>
        {{else}}
          <h6 class='card-subtitle mb-2' data-test-policy-deposit-expectation>
            Requires deposit into
            {{#each @policy.repositories as |repo index|}}
              {{if index ', '}}{{repo.name}}
            {{/each}}
          </h6>
        {{/if}}
        <p class='card-text mt-2' data-test-policy-description>
          {{{@policy.description}}}
          {{#if @policy.policyUrl}}
            <br />
            <br />
            For more information, see their official policy below.
            <br />
            <a href={{@policy.policyUrl}} target='_blank' data-test-policy-url>
              {{@policy.policyUrl}}
            </a>
          {{/if}}
          <br />
          <br />
          {{#if this.usesPmcRepository}}
            {{#if this.methodAJournal}}
              <div class='alert alert-success' data-test-method-a-journal-pmc-intro>
                The journal you published in will submit the published article to PMC on your behalf.
                <em>
                  You do not need to submit a manuscript to NIH Manuscript Submission System (NIHMS) as a part of this
                  process.
                </em>
              </div>
            {{else}}
              <div class='alert alert-info' data-test-non-method-a-journal-pmc-intro>
                <p>
                  Some journals would submit your article to PMC on your behalf, for a fee. Specific arrangements would
                  be required. Please indicate below whether or not you have made an arrangement with the publisher to
                  have your article deposited by your journal/publisher.
                </p>
                <input
                  aria-label='Workflow policies radio indicating no direct deposit'
                  type='radio'
                  checked={{not this.pmcPublisherDeposit}}
                  {{on 'change' (fn this.pmcPublisherDepositToggled false)}}
                  data-test-workflow-policies-radio-no-direct-deposit
                />
                I would like to submit my manuscript to PMC via the NIH Manuscript System (NIHMS) as part of this
                process.
                <br />
                <input
                  aria-label='Workflow policies radio indicating a direct deposit'
                  type='radio'
                  checked={{this.pmcPublisherDeposit}}
                  {{on 'change' (fn this.pmcPublisherDepositToggled true)}}
                  data-test-workflow-policies-radio-direct-deposit
                />
                I have made (or intend to make) an arrangement with the publisher to deposit my article directly to PMC
                and will not submit my article as part of this process.
              </div>
            {{/if}}
          {{/if}}
        </p>
      </div>
    </div>
  </template>
}
