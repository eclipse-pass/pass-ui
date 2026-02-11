import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { Input } from '@ember/component';
import { Textarea } from '@ember/component';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';

interface MessageDialogSignature {
  Args: {
    show?: boolean;
    to?: string;
    subject?: string;
    message?: string;
  };
}

export default class MessageDialog extends Component<MessageDialogSignature> {
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

  <template>
    {{! template-lint-disable require-input-label }}
    {{#if this.show}}
      <ModalDialog @onClose={{this.toggleModal}} @translucentOverlay={{false}}>
        <form class='dialog-form-width'>
          <div class='mb-3 row'>
            <label class='col-sm-3 col-form-label' for='msg-to'>Recipient:</label>
            <div class='col-sm-9'>
              <Input aria-label='msg-to' id='msg-to' class='form-control' @type='text' @value={{this.to}} />
            </div>
          </div>

          <div class='mb-3 row'>
            <label class='col-sm-3 col-form-label' for='msg-subject'>Subject:</label>
            <div class='col-sm-9'>
              <Input
                aria-label='msg-subject'
                id='msg-subject'
                class='form-control'
                @type='text'
                @value={{this.subject}}
              />
            </div>
          </div>

          <div class='mb-3'>
            <label for='msg-text'>Message:</label>
            <Textarea aria-label='msg-text' id='msg-text' class='form-control' @value={{this.message}} rows='10' />
          </div>
        </form>

        <button type='button' class='btn btn-primary btm-sm' {{on 'click' this.cancel}}>Cancel</button>
        <button type='button' class='btn btn-primary btm-sm' {{on 'click' this.send}}>Send</button>
      </ModalDialog>
    {{/if}}
  </template>
}
