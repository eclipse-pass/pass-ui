import Component from '@glimmer/component';
import stripEmptyArrays from 'pass-ui/util/strip-empty-arrays';
import { action } from '@ember/object';

export default class MetadataForm extends Component {
  @action
  setupMetadataForm() {
    const componentContext = this;
    const originalForm = this.args.schema;
    const newForm = JSON.parse(JSON.stringify(originalForm));
    if (!originalForm.options) {
      newForm.options = {};
    }

    // form ctrls
    newForm.options.form = {
      buttons: {
        Back: {
          title: 'Back',
          styles: 'pull-left btn btn-outline-primary',
          click() {
            componentContext.args.previousForm(stripEmptyArrays(this.getValue()));
          },
        },
        Abort: {
          label: 'Cancel',
          styles: 'pull-left btn btn-outline-danger ml-2',
          click() {
            componentContext.args.cancel();
          },
        },
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary next',
          click() {
            componentContext.args.nextForm(stripEmptyArrays(this.getValue()));
          },
        },
      },
    };

    newForm.options.hideInitValidationError = true;

    $('#schemaForm').empty();
    $('#schemaForm').alpaca(newForm);
  }
}
