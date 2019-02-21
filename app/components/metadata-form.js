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

    // Validate common page
    let isValidated = true;
    if (newForm.options.fields['Embargo-end-date']) {
      newForm.options.fields['Embargo-end-date'].validator = function (callback) {
        var value = this.getValue();
        var underEmbargo = this.getParent().childrenByPropertyId['under-embargo'].getValue();
        if (underEmbargo && !value) {
          toastr.warning('The embargo end date must not be left blank');
          isValidated = false;
          callback({
            status: false,
            message: 'This field is required'
          });
          return;
        }
        $('input[name=Embargo-end-date]').css('border-color', '#c2cfd6');
        $('.alpaca-form-button-Next').css('opacity', '1');
        isValidated = true;
        callback({
          status: true
        });
      };
    }

    if (newForm.options.fields['under-embargo']) {
      newForm.options.fields['under-embargo'].validator = function (callback) {
        var underEmbargo = this.getParent().childrenByPropertyId['under-embargo'].getValue();
        var EmbargoEndDate = this.getParent().childrenByPropertyId['Embargo-end-date'].getValue();

        if (underEmbargo && !EmbargoEndDate) {
          isValidated = false;
          $('input[name=Embargo-end-date]').css('border-color', '#f86c6b');
          $('.alpaca-form-button-Next').css('opacity', '0.65');
          return;
        }
        $('input[name=Embargo-end-date]').css('border-color', '#c2cfd6');
        $('.alpaca-form-button-Next').css('opacity', '1');
        isValidated = true;
      };
    }
    // form ctrls
    newForm.options.form = {
      buttons: {
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary next',
          click() {
            if (isValidated) {
              that.nextForm(this.getValue());
            }
          },
        },
        Back: {
          title: 'Back',
          styles: 'pull-left btn btn-outline-primary',
          click() {
            if (isValidated) {
              that.previousForm(this.getValue());
            }
          },
        },
      },
    };

    // let currentUser = this.get('currentUser.user');
    // let hasAgreementText = false;

    // try {
    //   this.get('submission.repositories').filter(repo => repo.get('name') === newForm.id)[0].get('agreementText');
    //   hasAgreementText = true;
    // } catch (e) {} // eslint-disable-line
    // if (hasAgreementText) {
    //   // if the current user is not the preparer
    //   if (!this.get('submission.preparers').map(x => x.id).includes(currentUser.get('id'))) {
    //     // add agreement to schema
    //     newForm.options.fields.embargo = {
    //       type: 'textarea',
    //       label: 'Deposit Agreement',
    //       disabled: true,
    //       rows: '16',
    //       hidden: false,
    //     };
    //     newForm.options.fields['agreement-to-deposit'] = {
    //       type: 'checkbox',
    //       rightLabel: 'I agree to the above statement on today\'s date',
    //       fieldClass: 'col-12 text-right p-0',
    //       hidden: false,
    //     };

    //     newForm.schema.properties.embargo = {
    //       type: 'string',
    //       default: this.get('submission.repositories').filter(repo => repo.get('name') === newForm.id)[0].get('agreementText'),
    //     };
    //     newForm.schema.properties['agreement-to-deposit'] = {
    //       type: 'string'
    //     };
    //   }
    // }
    $(document).ready(() => {
      $('#schemaForm').empty();
      $('#schemaForm').alpaca(newForm);
    });
  }
});
