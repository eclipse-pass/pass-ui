/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Component from '@glimmer/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SubmissionRepoDetails extends Component {
  @service store;

  get status() {
    const deposit = this.args.deposit;
    const repoCopy = this.args.repoCopy;
    const source = get(this, 'args.submission.source');
    const isSubmitted = get(this, 'args.submission.submitted');

    if (!isSubmitted) {
      return 'not-submitted';
    }

    if (repoCopy) {
      const cs = get(repoCopy, 'copyStatus');
      if (cs === 'complete' || cs === 'stalled' || cs === 'rejected') {
        return cs;
      }
    }

    if (deposit && get(deposit, 'depositStatus') === 'failed') {
      return 'failed';
    }

    // Failed aggregatedDepositStatus means deposit never created
    if (!deposit && source == 'pass' && get(this, 'submission.aggregatedDepositStatus') === 'failed') {
      return 'failed';
    }

    return 'submitted';
  }

  /**
   * Return a tooltip based on the current status.
   */
  get tooltip() {
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
        return 'The system failed to receive the files for this submission. Please try again by starting a new submission';
      case 'rejected':
        return 'This target repository has rejected your submission. Please contact us for more details or try to submit your manuscript again.';
      case 'not-submitted':
        return 'The submission has not been officially submitted to PASS. When the submitter approves the submission, the status will update to \'Submitted\'';
      default:
        return '';
    }
  }

  /**
   * Is this an external repository - is this not tracked by PASS
   * (e.g. US Dept of Education submission system ERIC)
   */
  get isExternalRepo() {
    return get(this, 'args.repo._isWebLink');
  }

  get isSubmitted() {
    return get(this, 'args.submission.submitted');
  }
}
