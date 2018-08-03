import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  submissionStatus: service(),

  status: Ember.computed('record', function () {
    const submission = this.get('record');
    const repoCopies = this.get('column.repoCopiesMap')[submission.get('id')];
    const deposits = this.get('column.depositsMap')[submission.get('id')];
    return this.get('submissionStatus').calculateStatus(submission, repoCopies, deposits);
  })
});
