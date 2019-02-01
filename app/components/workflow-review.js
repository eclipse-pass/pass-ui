import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),
  metadataService: service('metadata-blob'),
  currentUser: service('current-user'),
  isValidated: Ember.A(),
  init() {
    this._super(...arguments);
    $('[data-toggle="tooltip"]').tooltip();
  },
  externalRepoMap: {},
  filesTemp: Ember.computed('workflow.filesTemp', function () {
    return this.get('workflow').getFilesTemp();
  }),
  parsedFiles: Ember.computed('filesTemp', 'model.files', function () {
    let newArr = Ember.A();
    if (this.get('filesTemp')) {
      newArr.addObjects(this.get('filesTemp'));
    }
    if (this.get('model.files')) {
      newArr.addObjects(this.get('model.files'));
    }
    return newArr;
  }),
  metadata: Ember.computed('model.newSubmission.metadata', function () {
    return JSON.parse(this.get('model.newSubmission.metadata'));
  }),
  metadataBlobNoKeys: Ember.computed(
    'model.newSubmission.metadata',
    function () {
      return this.get('metadataService').getDisplayBlob(this.get('model.newSubmission.metadata'));
    }
  ),
  hasVisitedWeblink: Ember.computed('externalRepoMap', function () {
    return Object.values(this.get('externalRepoMap')).every(val => val === true);
  }),
  weblinkRepos: Ember.computed('model.newSubmission.repositories', function () {
    const repos = this.get('model.newSubmission.repositories').filter(repo =>
      repo.get('integrationType') === 'web-link');

    repos.forEach(repo => (this.get('externalRepoMap')[repo.get('id')] = false)); // eslint-disable-line
    return repos;
  }),
  mustVisitWeblink: Ember.computed('weblinkRepos', 'model', function () {
    const weblinkExists = this.get('weblinkRepos.length') > 0;
    const isSubmitter = this.get('currentUser.user.id') === this.get('model.newSubmission.submitter.id');
    return weblinkExists && isSubmitter;
  }),
  disableSubmit: Ember.computed(
    'mustVisitWeblink',
    'hasVisitedWeblink',
    function () {
      const needsToVisitWeblink = this.get('mustVisitWeblink') && !this.get('hasVisitedWeblink');
      return needsToVisitWeblink;
    }
  ),
  userIsPreparer: Ember.computed('model.newSubmission', 'currentUser.user', function () {
    const isNotSubmitter = this.get('model.newSubmission.submitter.id') !== this.get('currentUser.user.id');
    return (this.get('model.newSubmission.isProxySubmission') && isNotSubmitter);
  }),
  submitButtonText: Ember.computed('userIsPreparer', function () {
    return this.get('userIsPreparer') ? 'Request approval' : 'Submit';
  }),
  displaySubmitterEmail: Ember.computed('model.newSubmission.submitterEmail', function () {
    return this.get('model.newSubmission.submitterEmail').replace('mailto:', '');
  }),
  actions: {
    submit() {
      $('.block-user-input').css('display', 'block');
      let disableSubmit = true;
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

      if (!disableSubmit) {
        $('.block-user-input').css('display', 'none');
        return;
      }
      this.sendAction('submit');
    },
    agreeToDeposit() { this.set('step', 5); },
    back() { this.sendAction('back'); },
    checkValidate() {
      // TODO: I don't think this ever does anything? It was moved from workflow-wrapper during refactoring
      const tempValidateArray = [];
      this.set('isValidated', []);
      Object.keys(this.get('model.newSubmission').toJSON()).forEach((property) => {
        // TODO:  Add more logic here for better validation
        if (this.get('model.newSubmission').get(property) !== undefined) {
          tempValidateArray[property] = true;
        } else {
          tempValidateArray[property] = false;
        }
      });
      this.set('isValidated', tempValidateArray);
    },
    openWeblinkAlert(repo) {
      swal({
        title: 'Notice!',
        text:
          'You are being sent to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Open new tab'
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
