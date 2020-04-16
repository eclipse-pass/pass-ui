import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SelectRowToggle extends Component {
  @action
  clickOnRow(index, record, event) {
    this.args.clickOnRow(index, record);
    event.stopPropagation();
  }
}
