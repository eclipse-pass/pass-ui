/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-component-lifecycle-hooks, ember/no-get */
import Component from '@ember/component';
import _ from 'lodash';
import { get } from '@ember/object';

export default Component.extend({
  didRender() {
    this._super(...arguments);
    const that = this;
    const originalForm = get(this, 'schema');
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
            that.previousForm(that.stripEmptyArrays(this.getValue()));
          },
        },
        Abort: {
          label: 'Cancel',
          styles: 'pull-left btn btn-outline-danger ml-2',
          click() {
            that.cancel();
          },
        },
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary next',
          click() {
            that.nextForm(that.stripEmptyArrays(this.getValue()));
          },
        },
      },
    };

    newForm.options.hideInitValidationError = true;

    $('#schemaForm').empty();
    $('#schemaForm').alpaca(newForm);
  },

  /**
   * Remove empty array values from a JSON object. Keys that have a value of an empty
   * array will be removed. Does not dive into object values.
   *
   * @param {JSONObject} object
   */
  stripEmptyArrays(object) {
    Object.keys(object)
      .filter((key) => Array.isArray(object[key]) && object[key].length === 0)
      .forEach((key) => {
        delete object[key];
      });
    return object;
  },
});
