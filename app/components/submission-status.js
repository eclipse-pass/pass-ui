import Component from '@ember/component';

export default Component.extend({
  // For specs: https://github.com/OA-PASS/pass-ember/issues/568
  status: Ember.computed('submission', function () {
    const submission = this.get('submission');
    const repoCopies = this.get('repoCopies');
    const deposits = this.get('deposits');

    // TODO duplicated logic in submission-status-cell

    if (repoCopies.any(rc => rc.get('copyStatus') == 'stalled')) {
        return 'Stalled';
    }

    if (submission.get('source') == 'other' && !submission.get('submitted')) {
        return 'Manuscript expected';
    }

    if (repoCopies.get('length') < deposits.get('length')) {
      if (submission.get('source') == 'pass') {
        return 'Submitted';
      }
    }

    if (repoCopies.get('length') > 0 && repoCopies.get('length') == deposits.get('length')) {
      if (repoCopies.every(rc => rc.get('copyStatus') == 'complete')) {
        return 'Complete';
      }
    }

    return 'See details';
  })
});
