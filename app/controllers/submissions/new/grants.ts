import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type GrantModel from 'pass-ui/models/grant';
import type AppStore from 'pass-ui/services/store';

interface GrantsModel {
  newSubmission: SubmissionModel;
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsNewGrants extends Controller {
  declare model: GrantsModel;
  declare preLoadedGrant: GrantModel | null;
  @service declare store: AppStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

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

  @action
  loadNext(): void {
    this.loadTab('submissions.new.policies');
  }

  @action
  loadPrevious(): void {
    this.loadTab('submissions.new.basics');
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    await this.store.persistRecord(this.submission);
    this.router.transitionTo(gotoRoute);
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
