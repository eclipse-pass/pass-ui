/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller, { inject as controller } from '@ember/controller';
import { action, get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SubmissionsNewGrants extends Controller {
  @alias('model.newSubmission') submission;
  @alias('model.preLoadedGrant') preLoadedGrant;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  @controller('submissions.new') parent;

  @action
  loadNext() {
    this.loadTab('submissions.new.policies');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.basics');
  }

  @action
  async loadTab(gotoRoute) {
    // add validation, processing
    await this.submission.save();
    this.transitionToRoute(gotoRoute);
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
