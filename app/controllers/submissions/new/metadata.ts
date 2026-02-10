/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';

export default class SubmissionsNewMetadata extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.newSubmission') submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.repositories') repositories: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.publication') publication: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.submissionEvents') submissionEvents: any;

  @controller('submissions.new') declare parent: SubmissionsNew;

  @action
  loadNext(): void {
    this.loadTab('submissions.new.files');
  }

  @action
  loadPrevious(): void {
    this.loadTab('submissions.new.repositories');
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
