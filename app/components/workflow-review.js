import WorkflowComponent from './workflow-component';

export default WorkflowComponent.extend({
  metadataService: Ember.inject.service('metadata-blob'),

  init() {
    this._super(...arguments);
    // // TODO:  add validation step here that checks the model each rerender
    // this.set('isValidated', false)
    $('[data-toggle="tooltip"]').tooltip();
  },

  externalRepoMap: {},
  // externalSubmission: Ember.computed('metadataBlobNoKeys', function () { // eslint-disable-line
  //   if (this.get('metadataBlobNoKeys').Submission) {
  //     return true;
  //   }
  //   return false;
  // }),
  parsedFiles: Ember.computed('filesTemp', function () {
    return this.get('filesTemp');
  }),
  metadata: Ember.computed('model.newSubmission.metadata', function () { // eslint-disable-line
    return JSON.parse(this.get('model.newSubmission.metadata'));
  }),
  metadataBlobNoKeys: Ember.computed('model.newSubmission.metadata', function () {
    return this.get('metadataService').getDisplayBlob(this.get('model.newSubmission.metadata'));
  }),
  hasVisitedWeblink: Ember.computed('externalRepoMap', function () {
    return Object.values(this.get('externalRepoMap')).every(val => val === true);
  }),
  weblinkRepos: Ember.computed('model.newSubmission.repositories', function () {
    const repos = this.get('model.newSubmission.repositories').filter(repo =>
      repo.get('integrationType') === 'web-link' ||
      repo.get('url') === 'https://eric.ed.gov/' ||
      repo.get('url') === 'https://dec.usaid.gov/');

    repos.forEach(repo => this.get('externalRepoMap')[repo.get('id')] = false); // eslint-disable-line
    // debugger
    return repos;
  }),
  mustVisitWeblink: Ember.computed('weblinkRepos', function () {
    return this.get('weblinkRepos').get('length') > 0;
  }),
  disableSubmit: Ember.computed('mustVisitWeblink', 'hasVisitedWeblink', function () {
    return this.get('mustVisitWeblink') && !this.get('hasVisitedWeblink');
  }),
  actions: {
    submit() {
      $('.block-user-input').css('display', 'block');
      let disableSubmit = true;
      let didNotAgree = true;
      // In case a crafty user edits the page HTML, don't submit when not allowed
      if (this.get('disableSubmit')) {
        if (!this.get('hasVisitedWeblink')) {
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
        $('.block-user-input').css('display', 'none');
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
    openWeblinkAlert(repo) {
      swal({
        title: 'Notice!',
        text: 'You are being redirected to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Redirect'
      }).then((value) => {
        if (value.dismiss) {
          // Don't redirect
          return;
        }
        // Go to the weblink repo

        this.get('externalRepoMap')[repo.get('id')] = true;
        const allLinksVisited = Object.values(this.get('externalRepoMap')).every(val => val === true);
        if (allLinksVisited) {
          this.set('hasVisitedWeblink', true);
        }
        $('#externalSubmission').modal('hide');

        var win = window.open(repo.get('url'), '_blank');
        win.focus();
      });
    }
  }
});
