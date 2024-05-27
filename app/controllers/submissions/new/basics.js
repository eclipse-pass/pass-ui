/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/use-brace-expansion, ember/require-computed-property-dependencies */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class SubmissionsNewBasics extends Controller {
  @service workflow;
  @service flashMessages;
  @service router;

  @alias('model.newSubmission') submission;
  @alias('model.publication') publication;
  @alias('model.submissionEvents') submissionEvents;
  @alias('model.journal') journal;
  @alias('workflow.doiInfo') doiInfo;

  @controller('submissions.new') parent;

  // these errors start as false since you don't want to immediately have all fields turn red
  @tracked titleError = false;
  @tracked journalError = false;
  @tracked submitterEmailError = false;

  get flaggedFields() {
    let fields = [];
    if (this.titleError) fields.pushObject('title');
    if (this.journalError) fields.pushObject('journal');
    if (this.submitterEmailError) fields.pushObject('submitterEmail');

    return fields;
  }

  @computed('publication.title')
  get titleIsInvalid() {
    return !get(this, 'publication.title');
  }

  @computed('publication.journal.id', 'publication.journal.journalName')
  get journalIsInvalid() {
    return !(get(this, 'publication.journal.id') || get(this, 'publication.journal.journalName'));
  }

  @computed('submission.submitter.id', 'submission.submitterEmail', 'submission.submitterName')
  get submitterIsInvalid() {
    return (
      !get(this, 'submission.submitter.id') &&
      (!get(this, 'submission.submitterEmail') || !get(this, 'submission.submitterName'))
    );
  }

  @computed('submission.submitterEmailDisplay')
  get submitterEmailIsInvalid() {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    let email = get(this, 'submission.submitterEmailDisplay');

    return !get(this, 'submission.submitter.id') && (!email || !emailPattern.test(email));
  }

  @action
  async loadTab(gotoRoute) {
    this.doiInfo.title = this.publication.title;

    await this.submission.save();
    this.router.transitionTo(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoRoute) {
    set(this, 'titleError', false);
    set(this, 'journalError', false);
    set(this, 'submitterEmailError', false);

    if (this.titleIsInvalid) {
      set(this, 'titleError', true);
      this.flashMessages.warning('The title must not be left blank');
    }

    if (this.titleIsInvalid) return; // end here

    // non proxy submission will always have current user as submitter, so only need to validate this for proxy submission
    if (get(this, 'submission.isProxySubmission')) {
      // If there's no submitter or submitter info and the submission is a new proxy submission:
      if (this.submitterIsInvalid) {
        this.flashMessages.warning(
          'You have indicated that you are submitting on behalf of someone, please select the user or enter their name and email address.'
        );
        return;
      }
      if (!get(this, 'submission.submitter.id')) {
        set(this, 'submitterEmailError', this.submitterEmailIsInvalid);
        if (this.submitterEmailIsInvalid) {
          set(this, 'submitterEmailError', true);
          this.flashMessages.warning(
            'The email address you entered is invalid. Please verify the value and try again.'
          );
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
