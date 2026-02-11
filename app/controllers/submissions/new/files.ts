/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type FileModel from 'pass-ui/models/file';

export default class SubmissionsNewFiles extends Controller {
  @service declare workflow: Workflow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.newSubmission') submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.publication') publication: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.submissionEvents') submissionEvents: any;

  @controller('submissions.new') declare parent: SubmissionsNew;

  @tracked loadingNext: boolean = false;

  @computed('workflow.maxStep')
  get nextTabIsActive(): boolean {
    return get(this, 'workflow').getMaxStep() > 6;
  }

  @computed('nextTabIsActive', 'loadingNext')
  get needValidation(): boolean {
    return this.nextTabIsActive || this.loadingNext;
  }

  @action
  loadNext(): void {
    set(this, 'loadingNext', true);
    this.validateAndLoadTab('submissions.new.review');
  }

  @action
  loadPrevious(): void {
    this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    this.updateRelatedData();
    await this.submission.save();
    set(this, 'loadingNext', false); // reset for next time
    this.router.transitionTo(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoTab: string): Promise<void> {
    const needValidation = this.needValidation;
    if (needValidation) {
      const manuscriptFiles = this.workflow
        .getFiles()
        .filter((file) => file && get(file, 'fileRole') === 'manuscript')
        .filter((file) => (file as unknown as FileModel).submission.id === this.submission.id);

      const submitter = await this.parent.userIsSubmitter();

      if (manuscriptFiles.length === 0 && !submitter) {
        const result = await swal.fire({
          target: ENV.APP.rootElement,
          title: 'No manuscript present',
          text: 'If no manuscript is attached, the designated submitter will need to add one before final submission',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
        });

        if (!result.dismiss) {
          this.loadTab(gotoTab);
        }
      } else if (manuscriptFiles.length === 0) {
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
  updateRelatedData(): void {
    const allFiles = this.workflow.getFiles();
    if (allFiles.length > 0) {
      allFiles.forEach((file) => {
        (file as unknown as FileModel).save();
      });
    }
  }

  @action
  abort(): void {
    this.parent.abort();
  }

  @action
  updateCovidSubmission(): void {
    this.parent.updateCovidSubmission();
  }
}
