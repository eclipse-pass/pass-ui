import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SubmissionsNewReview extends Controller {
  @alias('model.newSubmission') submission;
  @alias('model.files') files;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  parent = controller('submissions.new');

  @tracked waitingMessage = get(this, 'parent.waitingMessage');
  @tracked uploading = get(this, 'parent.uploading');
  @tracked comment = get(this, 'parent.comment');

  @action
  loadPrevious() {
    this.loadTab('submissions.new.files');
  }

  @action
  loadTab(gotoRoute) {
    // add validation, processing
    // this.get('submission').save().then(() => this.transitionToRoute(gotoRoute));
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
    get(this, 'parent').send('updateCovidSubmission');
  }
}
