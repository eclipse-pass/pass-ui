import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class WorkflowPolicies extends Component {
  @action
  cancel() {
    this.args.abort();
  }
}
