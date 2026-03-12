import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PolicyModel from 'pass-ui/models/policy';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type AppStore from 'pass-ui/services/store';

interface PoliciesModel {
  newSubmission: SubmissionModel;
  policies: PolicyModel[];
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsNewPolicies extends Controller {
  declare model: PoliciesModel;
  @service declare store: AppStore;
  @service declare router: RouterService;

  get submission(): SubmissionModel {
    return this.model.newSubmission;
  }
  get policies(): PolicyModel[] {
    return this.model.policies;
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
    this.loadTab('submissions.new.repositories');
  }

  @action
  loadPrevious(): void {
    this.loadTab('submissions.new.grants');
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
