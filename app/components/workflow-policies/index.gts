import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import PolicyCard from 'pass-ui/components/policy-card';

export default class WorkflowPolicies extends Component {
  @action
  cancel() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).abort();
  }

  <template>
    <div class='mb-3'>
      <p class='lead text-muted' data-test-workflow-policies-lead-text>
        Based on the information you provided so far, these are the public access policies that are applicable to your
        work:
      </p>
      {{#each @policies as |policy|}}
        <PolicyCard @policy={{policy}} @journal={{@publication.journal}} @submission={{@submission}} />
      {{/each}}
    </div>

    <button type='button' class='btn btn-outline-primary' data-test-workflow-policies-back {{on 'click' @back}}>
      Back
    </button>
    <button
      type='button'
      class='btn btn-outline-danger ml-2'
      data-test-workflow-policies-cancel
      {{on 'click' this.cancel}}
    >
      Cancel
    </button>
    <button type='button' class='btn btn-primary next pull-right' data-test-workflow-policies-next {{on 'click' @next}}>
      Next
    </button>
  </template>
}
