import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SubmissionsAuthorCell extends Component {
  @action
  // Send action to parent controller
  sendAction(actionName, record, person) {
    this[actionName](actionName, record, person);
  }
}
