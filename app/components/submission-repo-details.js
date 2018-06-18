import Component from '@ember/component';

export default Component.extend({
  store: Ember.inject.service(),

  status: Ember.computed('deposit', 'repo', 'repoCopy', function () {
    const deposit = this.get('deposit');
    const repo = this.get('repo');
    const repoCopy = this.get('repoCopy');

    if (repoCopy) {
      const cs = repoCopy.get('copyStatus');
      if (cs === 'complete') {
        return 'Complete';
      } else if (cs === 'stalled') {
        return 'Stalled';
      }
    }

    return 'Submitted';
  }),

  /**
   * Return a tooltip based on the current status.
   */
  tooltip: Ember.computed('status', function () {
    switch (this.get('status')) {
      case 'Complete':
        return 'Submission was accepted and processed by the repository. ID(s) have been assigned to the submitted manuscript.';
      case 'Stalled':
        return 'The repository has found a problem with your submission that has caused progress to stall. This may require direct interaction with the repository to re-initiate the process. Please check the repository website for more details.';
      case 'Submitted':
        return 'Your submission has been sent to the repository or is in queue to be sent.';
      default:
        return '';
    }
  }),

  /**
   * Is this an external repository - is this not tracked by PASS
   * (e.g. US Dept of Education submission system ERIC)
   */
  isExternalRepo: Ember.computed('repo', function () {
    return this.get('repo.url') === 'https://eric.ed.gov/';
  })
});
