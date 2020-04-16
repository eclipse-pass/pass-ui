import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class WorkflowWrapper extends Component {
  @action
  loadTab(gotoRoute) {
    this.args.loadTab(gotoRoute);
  }
}
