import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class OapComplianceCell extends Component {
  get isStalled() {
    if (get(this, 'grant.submissions')) {
      get(this, 'grant.submissions').forEach((submission) => {
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
  }
}
