import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class MessageDialog extends Component {
  @tracked show = false;
  @tracked to = '';
  @tracked subject = '';
  @tracked message = '';

  @action
  toggleModal() {
    this.toggleProperty('show');
  }

  @action
  cancel() {
    this.show = false;
  }

  @action
  send() {
    this.show = false;
  }
}
