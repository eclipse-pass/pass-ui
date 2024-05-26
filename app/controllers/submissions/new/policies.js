/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SubmissionsNewPolicies extends Controller {
  @service router;

  @alias('model.newSubmission') submission;
  @alias('model.policies') policies;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  @controller('submissions.new') parent;

  @action
  loadNext() {
    this.loadTab('submissions.new.repositories');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.grants');
  }

  @action
  async loadTab(gotoRoute) {
    // add validation, processing
    await this.submission.save();
    this.router.transitionTo(gotoRoute);
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
