// import Component from '@ember/component';
import Ember from 'ember';
import _ from 'lodash';

export default Ember.Component.extend({
  didRender() {
    this._super(...arguments);
    const that = this;
    const originalForm = this.get('schema');
    const newForm = JSON.parse(JSON.stringify(originalForm));
    if (!originalForm.options) {
      newForm.options = {};
    }

    // form ctrls
    newForm.options.form = {
      buttons: {
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary next',
          click() {
            that.nextForm(this.getValue());
          },
        },
        Back: {
          title: 'Back',
          styles: 'pull-left btn btn-outline-primary',
          click() {
            that.previousForm(this.getValue());
          },
        },
        Abort: {
          label: 'Abort',
          styles: 'pull-left btn btn-outline-danger ml-2',
          click() {
            that.cancel();
          }
        }
      },
    };

    $('#schemaForm').empty();
    $('#schemaForm').alpaca(newForm);
  }
});
