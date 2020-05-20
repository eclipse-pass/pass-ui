import Controller, { inject as controller } from '@ember/controller';
import { action, computed, get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SubmissionsNewReview extends Controller {
  @alias('model.newSubmission') submission;
  @alias('model.files') files;
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

  @computed('parent.comment')
  get comment() {
    return get(this, 'parent.comment');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.files');
  }

  @action
  loadTab(gotoRoute) {
    // add validation, processing
    // this.submission.save().then(() => this.transitionToRoute(gotoRoute));
    this.transitionToRoute(gotoRoute);
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
