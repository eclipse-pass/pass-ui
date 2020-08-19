import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MessageDialog extends Component {
  @tracked show = false;
  @tracked to = '';
  @tracked subject = '';
  @tracked message = '';

  @action
  toggleModal() {
    this.show = !this.show;
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
