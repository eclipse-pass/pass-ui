import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';
import type RouterService from '@ember/routing/router-service';
import type Model from '@ember-data/model';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type FileModel from 'pass-ui/models/file';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type AppStore from 'pass-ui/services/store';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

interface FilesModel {
  newSubmission: SubmissionModel;
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsNewFiles extends Controller {
  declare model: FilesModel;

  @service declare workflow: Workflow;
  @service declare store: AppStore;
  @service declare flashMessages: FlashMessageService;
  @service declare router: RouterService;

  get submission(): SubmissionModel {
    return this.model.newSubmission;
  }
  get publication(): PublicationModel {
    return this.model.publication;
  }
  get submissionEvents(): SubmissionEventModel[] {
    return this.model.submissionEvents;
  }

  @controller('submissions.new') declare parent: SubmissionsNew;

  @tracked loadingNext: boolean = false;

  get nextTabIsActive(): boolean {
    return this.workflow.getMaxStep() > 6;
  }

  get needValidation(): boolean {
    return this.nextTabIsActive || this.loadingNext;
  }

  @action
  async loadNext(): Promise<void> {
    this.loadingNext = true;
    await this.validateAndLoadTab('submissions.new.review');
  }

  @action
  async loadPrevious(): Promise<void> {
    await this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    await this.updateRelatedData();
    await this.store.persistRecord(this.submission);
    this.loadingNext = false; // reset for next time
    this.router.transitionTo(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoTab: string): Promise<void> {
    const needValidation = this.needValidation;
    if (needValidation) {
      const manuscriptFiles = this.workflow
        .getFiles()
        .filter((file) => file && (file as unknown as FileModel).fileRole === 'manuscript')
        .filter((file) => (file as unknown as FileModel).submission.id === this.submission.id);

      const submitter = this.parent.userIsSubmitter();

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
          await this.loadTab(gotoTab);
        }
      } else if (manuscriptFiles.length === 0) {
        this.flashMessages.warning('At least one manuscript file is required');
      } else if (manuscriptFiles.length > 1) {
        this.flashMessages.warning(
          `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}`,
        );
      } else {
        await this.loadTab(gotoTab);
      }
    } else {
      await this.loadTab(gotoTab);
    }
  }

  @action
  async updateRelatedData(): Promise<void> {
    const allFiles = this.workflow.getFiles();
    if (allFiles.length > 0) {
      await Promise.all(allFiles.map((file) => this.store.persistRecord(file as unknown as Model)));
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
