import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  submissionStatus: service(),

  status: Ember.computed('submission', function () {
    const submission = this.get('submission');
    const repoCopies = this.get('repoCopies');
    const deposits = this.get('deposits');

    return this.get('submissionStatus').calculateStatus(submission, repoCopies, deposits);
  })
});
