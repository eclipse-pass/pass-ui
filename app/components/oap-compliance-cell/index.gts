import Component from '@glimmer/component';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type DepositModel from 'pass-ui/models/deposit';

interface OapComplianceCellSignature {
  Args: {
    grant: GrantModel & { submissions?: (SubmissionModel & { deposits?: DepositModel[] })[] };
  };
}

export default class OapComplianceCell extends Component<OapComplianceCellSignature> {
  get isStalled(): boolean {
    const grant = this.args.grant;
    if (grant?.submissions) {
      for (const submission of grant.submissions) {
        if (submission.deposits) {
          for (const deposit of submission.deposits) {
            if (deposit.depositStatus === 'stalled') {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  <template>
    {{#if this.isStalled}}
      <div class='text-center'>
        <p><i class='fas fa-circle mr-1'></i>
          <span class='test'>stalled (<a href='#'>?</a>)</span></p>
      </div>
    {{else}}
      no issues detected
    {{/if}}
  </template>
}
