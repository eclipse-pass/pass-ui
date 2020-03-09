import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  workflow: service('workflow'),
  parent: controller('submissions.new'),
  submission: alias('model.newSubmission'),
  files: alias('model.files'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  nextTabIsActive: computed('workflow.maxStep', function () {
    return (this.get('workflow').getMaxStep() > 6);
  }),
  loadingNext: false,
  needValidation: computed('nextTabIsActive', 'loadingNext', function () {
    return (this.get('nextTabIsActive') || this.get('loadingNext'));
  }),
  newFiles: computed('workflow.filesTemp', {
    get(key) {
      return this.get('workflow').getFilesTemp();
    },
    set(key, value) {
      this.get('workflow').setFilesTemp(value);
      return value;
    }
  }),
  actions: {
    loadNext() {
      this.set('loadingNext', true);
      this.send('validateAndLoadTab', 'submissions.new.review');
    },
    loadPrevious() {
      this.send('validateAndLoadTab', 'submissions.new.metadata');
    },
    loadTab(gotoRoute) {
      this.send('updateRelatedData');
      this.get('submission').save().then(() => {
        this.transitionToRoute(gotoRoute);
        this.set('loadingNext', false); // reset for next time
      });
    },
    validateAndLoadTab(gotoTab) {
      let needValidation = this.get('needValidation');
      if (needValidation) {
        let files = this.get('files');
        let manuscriptFiles = [].concat(this.get('newFiles'), files && files.toArray())
          .filter(file => file && file.get('fileRole') === 'manuscript');
        let userIsSubmitter = this.get('parent').get('userIsSubmitter');
        if (manuscriptFiles.length == 0 && !userIsSubmitter) {
          swal({
            title: 'No manuscript present',
            text: 'If no manuscript is attached, the designated submitter will need to add one before final submission',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (!result.dismiss) {
              this.send('loadTab', gotoTab);
            }
          });
        } else if (manuscriptFiles.length == 0) {
          toastr.warning('At least one manuscript file is required');
        } else if (manuscriptFiles.length > 1) {
          toastr.warning(`Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}`);
        } else {
          this.send('loadTab', gotoTab);
        }
      } else {
        this.send('loadTab', gotoTab);
      }
    },
    updateRelatedData() {
      let files = this.get('files');
      // Update any *existing* files that have had their details modified
      if (files) {
        files.forEach((file) => {
          if (file.get('hasDirtyAttributes')) {
            // Asynchronously save the updated file metadata.
            file.save();
          }
        });
      }
    },
    abort() {
      this.get('parent').send('abort');
    }
  }

});
