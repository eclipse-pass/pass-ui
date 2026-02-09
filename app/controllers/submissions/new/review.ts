/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller, { inject as controller } from '@ember/controller';
import { action, computed, get } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SubmissionsNewReview extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.newSubmission') submission: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.publication') publication: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @alias('model.submissionEvents') submissionEvents: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @controller('submissions.new') declare parent: any;

  @computed('parent.waitingMessage')
  get waitingMessage(): string {
    return get(this, 'parent.waitingMessage');
  }

  @computed('parent', 'parent.uploading')
  get uploading(): boolean {
    return get(this, 'parent.uploading');
  }

  @tracked comment: string = this.parent.comment;

  @action
  loadPrevious(): void {
    this.loadTab('submissions.new.files');
  }

  @action
  loadTab(gotoRoute: string): void {
    this.router.transitionTo(gotoRoute);
  }

  @action
  submit(): void {
    this.parent.submit();
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
