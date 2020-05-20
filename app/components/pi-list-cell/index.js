import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PiListCell extends Component {
  @action
  sendAction(actionName, record) {
    this[actionName](actionName, record);
  }
}
