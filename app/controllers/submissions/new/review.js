/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller, { inject as controller } from '@ember/controller';
import { action, computed, get } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SubmissionsNewReview extends Controller {
  @service router;
  @service workflow;

  @alias('model.newSubmission') submission;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  @controller('submissions.new') parent;

  @computed('parent.waitingMessage')
  get waitingMessage() {
    return get(this, 'parent.waitingMessage');
  }

  @computed('parent', 'parent.uploading')
  get uploading() {
    return get(this, 'parent.uploading');
  }

  @tracked comment = this.parent.comment;

  @action
  loadPrevious() {
    this.loadTab('submissions.new.files');
  }

  @action
  loadTab(gotoRoute) {
    this.router.transitionTo(gotoRoute);
  }

  @action
  submit() {
    this.parent.submit();
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
