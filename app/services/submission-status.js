import Service from '@ember/service';

export default Service.extend({

  // Determine the status of a submission given associated repoCopies and deposits.
  // TODO Document the status semantics and unit test.
  // Some (out of date?) information https://github.com/OA-PASS/pass-ember/issues/568
  calculateStatus(submission, repoCopies, deposits) {
    if (!submission) {
      return '';
    }

    if (submission.get('aggregatedDepositStatus') === 'failed') {
      return 'See details'; // show failed
    }

    if (repoCopies && repoCopies.any(rc => rc.get('copyStatus') == 'stalled')) {
      return 'Stalled';
    }

    if (submission.get('source') == 'other' && !submission.get('submitted')) {
      return 'Manuscript expected';
    }

    if (!repoCopies || repoCopies.get('length') == 0) {
      if (submission.get('source') == 'pass' && submission.get('submitted')) {
        return 'Submitted';
      }
    }

    if (repoCopies && repoCopies.get('length') > 0 && repoCopies.get('length') == deposits.get('length')) {
      if (repoCopies.every(rc => rc.get('copyStatus') == 'complete')) {
        return 'Complete';
      }
    }

    if (repoCopies && repoCopies.get('length') > deposits.get('length')) {
      if (submission.get('source') == 'other' && submission.get('submitted') &&
          repoCopies.any(rc => rc.get('copyStatus') == 'complete')) {
        return 'Complete';
      }
    }

    return 'See details';
  }
});
