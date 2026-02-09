/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SubmissionsNewPolicies extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.newSubmission') submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.policies') policies: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.publication') publication: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.submissionEvents') submissionEvents: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @controller('submissions.new') declare parent: any;

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
