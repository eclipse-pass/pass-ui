/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PolicyModel from 'pass-ui/models/policy';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';

export default class SubmissionsNewPolicies extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  @alias('model.newSubmission') submission!: SubmissionModel;
  @alias('model.policies') policies!: PolicyModel[];
  @alias('model.publication') publication!: PublicationModel;
  @alias('model.submissionEvents') submissionEvents!: SubmissionEventModel[];

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
    // add validation, processing
    await this.submission.save();
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
