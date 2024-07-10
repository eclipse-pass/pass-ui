/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import ENV from 'pass-ui/config/environment';

export default class SubmissionsNewFiles extends Controller {
  @service workflow;
  @service flashMessages;
  @service router;

  @alias('model.newSubmission') submission;
  @alias('model.files') files;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  @controller('submissions.new') parent;

  @tracked loadingNext = false;
  @tracked filesTemp = this.workflow.filesTemp;
  @tracked newFiles = [];
  @tracked previouslyUploadedFiles = this.model.files;

  @computed('workflow.maxStep')
  get nextTabIsActive() {
    return get(this, 'workflow').getMaxStep() > 6;
  }

  @computed('nextTabIsActive', 'loadingNext')
  get needValidation() {
    return this.nextTabIsActive || this.loadingNext;
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
    this.router.transitionTo(gotoRoute);
  }

  @action
  updateAllFiles(files) {
    const filteredFiles = _.uniq(files, 'id').filter((file) => file.submission.id === this.submission.id);

    this.workflow.filesTemp = [...filteredFiles, ...this.workflow.filesTemp];
    filteredFiles.forEach((file) => {
      file.submission = this.submission;
    });
  }

  @action
  updatePreviouslyUploadedFiles(files) {
    this.previouslyUploadedFiles = [...files];
  }

  @action
  updateNewFiles(files) {
    this.newFiles = [...files];
  }

  @action
  async validateAndLoadTab(gotoTab) {
    let needValidation = this.needValidation;
    if (needValidation) {
      let manuscriptFiles = [...this.newFiles, ...this.model.files.slice()]
        .filter((file) => file && get(file, 'fileRole') === 'manuscript')
        .filter((file) => file.submission.id === this.submission.id);

      const submitter = await this.parent.userIsSubmitter();

      if (manuscriptFiles.length == 0 && !submitter) {
        let result = await swal({
          target: ENV.APP.rootElement,
          title: 'No manuscript present',
          text: 'If no manuscript is attached, the designated submitter will need to add one before final submission',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
        });

        if (!result.dismiss) {
          this.loadTab(gotoTab);
        }
      } else if (manuscriptFiles.length == 0) {
        this.flashMessages.warning('At least one manuscript file is required');
      } else if (manuscriptFiles.length > 1) {
        this.flashMessages.warning(
          `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}`,
        );
      } else {
        this.loadTab(gotoTab);
      }
    } else {
      this.loadTab(gotoTab);
    }
  }

  @action
  updateRelatedData() {
    const allFiles = [...this.model.files, ...this.newFiles];
    if (allFiles.length > 0) {
      allFiles.forEach((file) => {
        file.save();
      });
    }
  }

  @action
  abort() {
    this.parent.abort();
  }

  @action
  updateCovidSubmission() {
    this.parent.updateCovidSubmission();
  }
}
