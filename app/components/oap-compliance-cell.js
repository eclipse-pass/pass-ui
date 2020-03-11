import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  isStalled: computed('grant', function () {
    if (this.get('grant.submissions')) {
      this.get('grant.submissions').forEach((submission) => {
        if (submission.get('deposits')) {
          submission.get('deposits').forEach((deposit) => {
            if (deposit.get('depositStatus') === 'stalled') {
              return true;
            }
          });
        }
      });
    }
    return false;
  })
});
