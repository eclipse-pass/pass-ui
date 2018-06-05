import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  init() {
    this._super(...arguments);
    // // TODO:  add validation step here that checks the model each rerender
    // this.set('isValidated', false)
      $('[data-toggle="tooltip"]').tooltip();

  },
  externalSubmission: Ember.computed('metadataBlobNoKeys', function () { // eslint-disable-line
    if (this.get('metadataBlobNoKeys').Submission) {
      return true;
    }
    return false;
  }),
  parsedFiles: Ember.computed('filesTemp', function () {
    return this.get('filesTemp');
  }),
  metadata: Ember.computed('model.newSubmission.metadata', function () { // eslint-disable-line
    return JSON.parse(this.get('model.newSubmission.metadata'));
  }),
  metadataBlobNoKeys: Ember.computed('model.newSubmission.metadata', function () { // eslint-disable-line
    let metadataBlobNoKeys = [];
    JSON.parse(this.get('model.newSubmission.metadata')).forEach((ele) => {
      for (var key in ele.data) {
        if (ele.data.hasOwnProperty(key)) {
          let strippedData;
          strippedData = ele.data[key];

          if (key === 'authors') {
            if (metadataBlobNoKeys['author(s)']) {
              metadataBlobNoKeys['author(s)'] = _.uniqBy(metadataBlobNoKeys['author(s)'].concat(strippedData), 'author');
            } else {
              metadataBlobNoKeys['author(s)'] = strippedData;
            }
          } else if (key === 'container-title') {
            metadataBlobNoKeys['journal-title'] = strippedData;
          } else {
            metadataBlobNoKeys[key] = strippedData;
          }
        }
      }
    });
    for (var key in metadataBlobNoKeys) {
      if (metadataBlobNoKeys.hasOwnProperty(key)) {
        metadataBlobNoKeys[_.capitalize(key)] = metadataBlobNoKeys[key];
        delete metadataBlobNoKeys[key];
      }
    }
    return metadataBlobNoKeys;
  }),
  hasVisitedEric: false,
  mustVisitEric: Ember.computed('model.newSubmission.metadata', function () {
    return JSON.parse(this.get('model.newSubmission.metadata')).map(m => m.id).includes('eric');
  }),
  disableSubmit: Ember.computed('mustVisitEric', 'hasVisitedEric', function () {
    return this.get('mustVisitEric') && !this.get('hasVisitedEric');
  }),
  actions: {
    clickEric() {
      this.set('hasVisitedEric', true);
      $('#externalSubmission').modal('hide');
    },
    submit() {
      let disableSubmit = true;
      let didNotAgree = true;
      // In case a crafty user edits the page HTML, don't submit when not allowed
      if (this.get('disableSubmit')) {
        if (!this.get('hasVisitedEric')) {
          $('.fa-exclamation-triangle').css('color', '#f86c6b');
          $('.fa-exclamation-triangle').css('font-size', '2.2em');
          setTimeout(() => {
            $('.fa-exclamation-triangle').css('color', '#b0b0b0');
            $('.fa-exclamation-triangle').css('font-size', '2em');
          }, 4000);
          toastr.warning('Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.');
        }
        disableSubmit = false;
      }
      if (this.get('didNotAgree')) {
        didNotAgree = false;
      }

      if (!disableSubmit) {
        return;
      }
      this.sendAction('submit');
    },
    agreeToDeposit() {
      this.set('step', 5);
    },
    back() {
      this.sendAction('back');
    },
    checkValidate() {
      this.sendAction('validate');
    },
    openEricAlert() {
      swal(
        'Notice!',
        'You are being redirected to an external site. This will open in a new tab.',
        {
          buttons: {
            cancel: {
              text: 'Cancel',
            },
            confirm: {
              text: 'Redirect',
            },
          }
        },
      ).then((value) => {
        if (value.dismiss) {
          console.log('dont redirect');
          return;
        }
        console.log('go to eric');
        this.send('clickEric');
        var win = window.open('https://eric.ed.gov/submit/', '_blank');
        win.focus();
        // remove jscholership from submission
        //this.set('model.newSubmission.repositories', this.get('model.newSubmission.repositories').filter(repo => repo.get('name') !== 'JScholarship'));
      });
    }
  }
});
