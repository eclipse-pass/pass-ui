/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';

export default class SubmissionsNewRepositories extends Controller {
  @service workflow;
  @service router;

  @alias('model.newSubmission') submission;
  @alias('model.repositories') repositories;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;

  @controller('submissions.new') parent;

  @tracked maxStep = this.workflow.maxStep;
  @tracked loadingNext = false;

  get nextTabIsActive() {
    return get(this, 'workflow').getMaxStep() > 6;
  }

  get needValidation() {
    return this.nextTabIsActive || this.loadingNext;
  }

  @action
  loadNext() {
    set(this, 'loadingNext', true);
    this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.policies');
  }

  @action
  async loadTab(gotoRoute) {
    await this.submission.save();
    this.router.transitionTo(gotoRoute);
    set(this, 'loadingNext', false); // reset for next time
  }

  @action
  async validateAndLoadTab(gotoRoute) {
    let needValidation = this.needValidation;
    if (needValidation && get(this, 'submission.repositories.length') == 0) {
      let value = await swal.fire({
        target: ENV.APP.rootElement,
        icon: 'warning',
        title: 'No repositories selected',
        html:
          'If you don\'t plan on submitting to any repositories, you can stop at this time. Click "Exit ' +
          'submission" to return to the dashboard, or "Continue submission" to go back and select a repository',
        showCancelButton: true,
        cancelButtonText: 'Exit Submission',
        confirmButtonText: 'Continue submission',
      });

      if (value.dismiss) {
        this.router.transitionTo('dashboard');
      }
      // do nothing
    } else {
      this.loadTab(gotoRoute);
    }
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
