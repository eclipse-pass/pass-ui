import Component from '@glimmer/component';
import RepocopyDisplay from 'pass-ui/components/repocopy-display';
import type RepositoryModel from 'pass-ui/models/repository';
import type DepositModel from 'pass-ui/models/deposit';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';
import type SubmissionModel from 'pass-ui/models/submission';

const eq = (a: unknown, b: unknown) => a === b;

interface SubmissionRepoDetailsSignature {
  Args: {
    repo: RepositoryModel;
    deposit?: DepositModel;
    repoCopy?: RepositoryCopyModel;
    submission?: SubmissionModel;
  };
}

export default class SubmissionRepoDetails extends Component<SubmissionRepoDetailsSignature> {
  get status(): string {
    const deposit = this.args.deposit;
    const repoCopy = this.args.repoCopy;
    const source = this.args.submission?.source;
    const isSubmitted = this.args.submission?.submitted;

    if (!isSubmitted) {
      return 'not-submitted';
    }

    if (repoCopy) {
      const cs = repoCopy.copyStatus;
      if (cs === 'complete' || cs === 'stalled' || cs === 'rejected') {
        return cs;
      }
    }

    if (deposit && deposit.depositStatus === 'failed') {
      return 'failed';
    }

    if (deposit && deposit.depositStatus === 'retry') {
      return 'retry';
    }

    // Failed aggregatedDepositStatus means deposit never created
    if (!deposit && source == 'pass' && this.args.submission?.aggregatedDepositStatus === 'failed') {
      return 'failed';
    }

    return 'submitted';
  }

  get tooltip(): string {
    const depositStatusMsg = this.args.deposit?.statusMessage ? ` Message: ${this.args.deposit.statusMessage}.` : '';
    switch (this.status) {
      case 'complete':
        return 'Submission was accepted and processed by the repository. ID(s) have been assigned to the submitted manuscript.';
      case 'stalled':
        return 'The repository has found a problem with your submission that has caused progress to stall. Please contact the repository for more details.';
      case 'submitted':
        return 'Your submission has been sent to the repository or is in queue to be sent.';
      case 'manuscript-required':
        return 'Your funder is aware of this publication and is expecting the deposit of your manuscript.';
      case 'failed':
        return `The system failed to receive the files for this submission.${depositStatusMsg} Please try again by starting a new submission`;
      case 'retry':
        return `The system failed to connect to the target repository. The deposit will be automatically retried later.`;
      case 'rejected':
        return 'This target repository has rejected your submission. Please contact us for more details or try to submit your manuscript again.';
      case 'not-submitted':
        return "The submission has not been officially submitted to PASS. When the submitter approves the submission, the status will update to 'Submitted'";
      default:
        return '';
    }
  }

  get isExternalRepo(): boolean {
    return this.args.repo?._isWebLink;
  }

  get isSubmitted(): boolean {
    return this.args.submission?.submitted ?? false;
  }

  <template>
    {{! template-lint-disable link-rel-noopener }}
    <li>
      <div class='card float-start col-5 mr-3 mb-0'>
        <div class='card-body sub-status'>
          <div class='row card-title'>
            {{#if @repo.url}}
              <a href={{@repo.url}} target='_blank'>{{@repo.name}}</a>
            {{else}}
              {{@repo.name}}
            {{/if}}
          </div>
          <p class='card-text'>
            <div class='d-flex'>
              <strong class='col-5 px-0'>Deposit status: </strong>
              {{#unless this.isExternalRepo}}
                <div class='col'>
                  {{#if this.tooltip}}
                    <span class='{{this.status}}' tooltip-position='left' tooltip='{{this.tooltip}}'>
                      <i class='fas fa-info-circle deposit-status-icon'></i>
                      {{#if (eq this.status 'not-submitted')}}
                        n&#47;a
                      {{else}}
                        {{this.status}}
                      {{/if}}
                    </span>
                  {{else}}
                    <span class='{{this.status}}'>
                      <i class='fas fa-circle deposit-status-icon'></i>
                      {{this.status}}
                    </span>
                  {{/if}}
                </div>
              {{/unless}}
            </div>
            <hr class='my-2' />
            <RepocopyDisplay @repoCopy={{@repoCopy}} />
          </p>
        </div>
      </div>
    </li>
  </template>
}
