import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SubmissionsNewFiles extends Controller {
  @service workflow;

  @alias('model.newSubmission') submission;
  @alias('model.files') files;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  parent = controller('submissions.new');

  @tracked loadingNext = false;
  @tracked filesTemp = this.workflow.filesTemp;

  @computed('workflow.maxStep')
  get nextTabIsActive() {
    return get(this, 'workflow').getMaxStep() > 6;
  }

  @computed('nextTabIsActive', 'loadingNext')
  get needValidation() {
    return this.nextTabIsActive || this.loadingNext;
  }

  @computed('workflow.filesTemp')
  get newFiles() {
    return get(this, 'workflow').getFilesTemp();
  }

  @action
  loadNext() {
    set(this, 'loadingNext', true);
    this.validateAndLoadTab('submissions.new.review');
  }

  @action
  loadPrevious() {
    this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  async loadTab(gotoRoute) {
    this.updateRelatedData();
    await this.submission.save();
    set(this, 'loadingNext', false); // reset for next time
    this.transitionToRoute(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoTab) {
    let needValidation = this.needValidation;
    if (needValidation) {
      let files = this.files;
      let manuscriptFiles = [].concat(this.newFiles, files && files.toArray())
        .filter(file => file && get(file, 'fileRole') === 'manuscript');

      if (manuscriptFiles.length == 0 && !this.parent.userIsSubmitter) {
        let result = await swal({
          title: 'No manuscript present',
          text: 'If no manuscript is attached, the designated submitter will need to add one before final submission',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel'
        });

        if (!result.dismiss) {
          this.loadTab(gotoTab);
        }
      } else if (manuscriptFiles.length == 0) {
        toastr.warning('At least one manuscript file is required');
      } else if (manuscriptFiles.length > 1) {
        toastr.warning(`Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}`);
      } else {
        this.loadTab(gotoTab);
      }
    } else {
      this.loadTab(gotoTab);
    }
  }

  @action
  updateRelatedData() {
    let files = this.files;
    // Update any *existing* files that have had their details modified
    if (files) {
      files.forEach((file) => {
        if (get(file, 'hasDirtyAttributes')) {
          // Asynchronously save the updated file metadata.
          file.save();
        }
      });
    }
  }

  @action
  abort() {
    this.parent.abort();
  }

  @action
  updateCovidSubmission() {
    get(this, 'parent').send('updateCovidSubmission');
  }
}
