import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';

interface ReviewModel {
  newSubmission: SubmissionModel;
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsNewReview extends Controller {
  declare model: ReviewModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  @service declare workflow: Workflow;

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

  get waitingMessage(): string {
    return this.parent.waitingMessage;
  }

  get uploading(): boolean {
    return this.parent.uploading;
  }

  // @ts-expect-error TS2729 - @controller creates a prototype getter, available during field init
  @tracked comment: string = this.parent.comment;

  @action
  loadPrevious(): void {
    this.loadTab('submissions.new.files');
  }

  @action
  loadTab(gotoRoute: string): void {
    this.router.transitionTo(gotoRoute);
  }

  @action
  submit(): void {
    this.parent.submit();
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
