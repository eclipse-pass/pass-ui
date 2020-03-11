import { A } from '@ember/array';
import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  workflow: service('workflow'),
  submission: alias('model.newSubmission'),
  publication: alias('model.publication'),
  preLoadedGrant: alias('model.preLoadedGrant'),
  submissionEvents: alias('model.submissionEvents'),
  journal: alias('model.journal'),
  parent: controller('submissions.new'),

  // these errors start as false since you don't want to immediately have all fields turn red
  titleError: false,
  journalError: false,
  submitterEmailError: false,
  flaggedFields: computed('titleError', 'journalError', 'submitterEmailError', function () {
    let fields = A();
    if (this.get('titleError')) fields.pushObject('title');
    if (this.get('journalError')) fields.pushObject('journal');
    if (this.get('submitterEmailError')) fields.pushObject('submitterEmail');
    return fields;
  }),

  doiInfo: computed('workflow.doiInfo', {
    get(key) {
      return this.get('workflow').getDoiInfo();
    },
    set(key, value) {
      this.get('workflow').setDoiInfo(value);
      return value;
    }
  }),
  titleIsInvalid: computed('publication.title', function () {
    return !(this.get('publication.title'));
  }),
  journalIsInvalid: computed('publication.journal.id', 'publication.journal.journalName', function () {
    return !(this.get('publication.journal.id') || this.get('publication.journal.journalName'));
  }),
  submitterIsInvalid: computed(
    'submission.submitter.id',
    'submission.submitterEmail',
    'submission.submitterName', function () {
      return (!this.get('submission.submitter.id')
            && (!this.get('submission.submitterEmail') || !this.get('submission.submitterName')));
    }
  ),
  submitterEmailIsInvalid: computed('submission.submitterEmailDisplay', 'submission.submitter.id', function () {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    let email = this.get('submission.submitterEmailDisplay');
    return (!this.get('submission.submitter.id') && (!email || !emailPattern.test(email)));
  }),

  actions: {
    loadNext() {
      this.send('validateAndLoadTab', 'submissions.new.grants');
    },
    loadTab(gotoRoute) {
      if (!this.get('doiInfo.title')) this.set('doiInfo.title', this.get('publication.title'));
      toastr.remove();

      this.get('submission').save().then(() => this.transitionToRoute(gotoRoute));
    },
    validateAndLoadTab(gotoRoute) {
      this.set('titleError', false);
      this.set('journalError', false);
      this.set('submitterEmailError', false);

      let titleIsInvalid = this.get('titleIsInvalid');
      if (titleIsInvalid) {
        this.set('titleError', true);
        toastr.warning('The title must not be left blank');
      }
      let journalIsInvalid = this.get('journalIsInvalid');
      if (journalIsInvalid) {
        this.set('journalError', true);
        toastr.warning('The journal must not be left blank');
      }

      if (titleIsInvalid || journalIsInvalid) return; // end here

      // non proxy submission will always have current user as submitter, so only need to validate this for proxy submission
      if (this.get('submission.isProxySubmission')) {
        // If there's no submitter or submitter info and the submission is a new proxy submission:
        if (this.get('submitterIsInvalid')) {
          toastr.warning('You have indicated that you are submitting on behalf of someone, please select the user or enter their name and email address.');
          return;
        }
        if (!this.get('submission.submitter.id')) {
          let submitterEmailIsInvalid = this.get('submitterEmailIsInvalid');
          this.set('submitterEmailError', submitterEmailIsInvalid);
          if (submitterEmailIsInvalid) {
            this.set('submitterEmailError', true);
            toastr.warning('The email address you entered is invalid. Please verify the value and try again.');
            return;
          }
        }
      }

      // After validation, we can save the publication to the Submission
      const publication = this.get('publication');
      publication.save().then(() => {
        this.set('submission.publication', publication);
      });

      this.send('loadTab', gotoRoute);
    },
    validateTitle() {
      this.set('titleError', this.get('titleIsInvalid'));
    },
    validateJournal() {
      this.set('journalError', this.get('journalIsInvalid'));
    },
    validateSubmitterEmail() {
      this.set('submitterEmailError', this.get('submitterEmailIsInvalid'));
    },
    abort() {
      this.get('parent').send('abort');
    }
  }
});
