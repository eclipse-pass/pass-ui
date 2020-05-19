import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SubmissionsNewBasics extends Controller {
  @service workflow;

  @alias('model.newSubmission') submission;
  @alias('model.publication') publication;
  @alias('model.preLoadedGrant') preLoadedGrant;
  @alias('model.submissionEvents') submissionEvents;
  @alias('model.journal') journal;

  parent = controller('submissions.new');

  // these errors start as false since you don't want to immediately have all fields turn red
  @tracked titleError = false;
  @tracked journalError = false;
  @tracked submitterEmailError = false;
  @tracked doiInfo = get(this, 'workflow.doiInfo');

  get flaggedFields() {
    let fields = A();
    if (this.titleError) fields.pushObject('title');
    if (this.journalError) fields.pushObject('journal');
    if (this.submitterEmailError) fields.pushObject('submitterEmail');

    return fields;
  }

  @computed('publication.title')
  get titleIsInvalid() {
    return !(get(this, 'publication.title'));
  }

  @computed('publication.journal.id', 'publication.journal.journalName')
  get journalIsInvalid() {
    return !(get(this, 'publication.journal.id') || get(this, 'publication.journal.journalName'));
  }

  @computed('submission.submitter.id', 'submission.submitterEmail', 'submission.submitterName')
  get submitterIsInvalid() {
    return (!get(this, 'submission.submitter.id') && (!get(this, 'submission.submitterEmail') || !get(this, 'submission.submitterName')));
  }

  @computed('submission.submitterEmailDisplay')
  get submitterEmailIsInvalid() {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    let email = get(this, 'submission.submitterEmailDisplay');

    return (!this.submitterId) && (!email || !emailPattern.test(email));
  }

  @action
  loadNext() {
    this.validateAndLoadTab('submissions.new.grants');
  }

  @action
  async loadTab(gotoRoute) {
    if (!this.doiInfo.title) set(this, 'doiInfo.title', get(this, 'publication.title'));
    toastr.remove();

    await this.submission.save();
    this.transitionToRoute(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoRoute) {
    set(this, 'titleError', false);
    set(this, 'journalError', false);
    set(this, 'submitterEmailError', false);

    if (this.titleIsInvalid) {
      set(this, 'titleError', true);
      toastr.warning('The title must not be left blank');
    }
    if (this.journalIsInvalid) {
      set(this, 'journalError', true);
      toastr.warning('The journal must not be left blank');
    }

    if (this.titleIsInvalid || this.journalIsInvalid) return; // end here

    // non proxy submission will always have current user as submitter, so only need to validate this for proxy submission
    if (get(this, 'submission.isProxySubmission')) {
      // If there's no submitter or submitter info and the submission is a new proxy submission:
      if (this.submitterIsInvalid) {
        toastr.warning('You have indicated that you are submitting on behalf of someone, please select the user or enter their name and email address.');
        return;
      }
      if (!this.submitterId) {
        set(this, 'submitterEmailError', this.submitterEmailIsInvalid);
        if (this.submitterEmailIsInvalid) {
          set(this, 'submitterEmailError', true);
          toastr.warning('The email address you entered is invalid. Please verify the value and try again.');
          return;
        }
      }
    }

    // After validation, we can save the publication to the Submission
    const publication = this.publication;
    await publication.save();
    set(this, 'submission.publication', publication);

    this.loadTab(gotoRoute);
  }

  @action
  updateCovidSubmission() {
    this.parent.updateCovidSubmission();
  }

  @action
  validateTitle() {
    set(this, 'titleError', this.titleIsInvalid);
  }

  @action
  validateJournal() {
    set(this, 'journalError', this.journalIsInvalid);
  }

  @action
  validateSubmitterEmail() {
    set(this, 'submitterEmailError', this.submitterEmailIsInvalid);
  }

  @action
  updatePublication(publication) {
    set(this, 'model.publication', publication);
  }

  @action
  updateDoiInfo(doiInfo) {
    this.workflow.setDoiInfo(doiInfo);
  }

  @action
  abort() {
    this.parent.send('abort');
  }
}
