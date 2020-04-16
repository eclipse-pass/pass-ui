import Component from '@glimmer/component';

export default class OapComplianceCell extends Component {
  get isStalled() {
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
  }
}
