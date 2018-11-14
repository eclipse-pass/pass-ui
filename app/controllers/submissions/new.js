import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  queryParams: ['grant', 'submission'],
  tempFiles: Ember.A(),
  didNotAgree: false, // JHU was included as a repository but will be removed before review because the deposit agreement wasn't accepted
  submitterEmail: '', // holds the email of a submitter not yet in the system.
  submitterName: '', // Holds the name of a submitter not yet in the system.
  comment: '', // Holds the comment that will be added to submissionEvent in the review step.
  hasProxy: Ember.computed( // Definite check for if the submission is in fact a proxy submission.
    'submitterEmail',
    'submitterName',
    'model.newSubmission.preparers',
    'model.newSubmission.hasNewProxy',
    function () {
      return (
        (this.get('submitterEmail') && this.get('submitterName')) ||
        this.get('model.newSubmission.preparers.length') > 0 ||
        this.get('model.newSubmission.hasNewProxy')
      );
    }
  ),
  userIsSubmitter: Ember.computed(
    'currentUser.user',
    'model.newSubmission',
    function () {
      return (
        this.get('model.newSubmission.submitter') ===
        this.get('currentUser.user')
      );
    }
  ),
  actions: {
    finishSubmission(s) {
      let subEvent = this.store.createRecord('submissionEvent');
      let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');

      subEvent.set('performedBy', this.get('currentUser.user'));
      subEvent.set('comment', this.get('comment'));
      subEvent.set('performedDate', new Date());
      subEvent.set('submission', s);
      subEvent.set('link', `${baseURL}${ENV.rootURL}submissions/${encodeURIComponent(`${s.id}`)}`);

      // If the person clicking submit *is* the submitter, actually submit the submission.
      if (s.get('submitter.id') === this.get('currentUser.user.id')) {
        s.set('submitted', true);
        s.set('submissionStatus', 'submitted');
        s.set('submittedDate', new Date());
        s.set(
          'repositories',
          s.get('repositories').filter(repo => (repo.get('integrationType') !== 'web-link'))
        );

        subEvent.set('performerRole', 'submitter');
        subEvent.set('eventType', 'submitted');
      } else {
        // If they *aren't* the submitter, they're the preparer.
        s.set('submissionStatus', 'approval-requested');
        subEvent.set('performerRole', 'preparer');

        // If a submitter is specified, it's a normal "approval-requested" scenario.
        if (s.get('submitter.id')) {
          subEvent.set('eventType', 'approval-requested');
        } else if (this.get('submitterName') && this.get('submitterEmail')) {
          // debugger; // eslint-disable-line
          // If not specified but a name and email are present, create a mailto link.
          subEvent.set('eventType', 'approval-requested-newuser');
          s.set('submitterEmail', `mailto:${this.get('submitterEmail')}`);
          s.set('submitterName', this.get('submitterName'));
        } // end if
      } // end if

      // Save the updated submission, then save the submissionEvent, then you're done!
      s.save().then(() => {
        subEvent.save().then(() => {
          this.set('uploading', false);
          this.set('filesTemp', Ember.A());
          this.set('comment', '');
          this.transitionToRoute('thanks', { queryParams: { submission: s.get('id') } });
        });
      });
    },
    submit() {
      // Remove JHU as a repository if its deposit agreement is not signed.
      if (this.get('didNotAgree')) {
        let jhuRepo = this.get('model.newSubmission.repositories').filter(repo => repo.get('name') === 'JScholarship');
        if (jhuRepo.length > 0) {
          jhuRepo = jhuRepo[0];
          this.get('model.newSubmission.repositories').removeObject(jhuRepo);
        }
      }

      // start setting variables on the new submission object.
      const sub = this.get('model.newSubmission');
      sub.set('submitted', false);
      sub.set('source', 'pass');
      sub.set('removeNIHDeposit', false);
      sub.set('aggregatedDepositStatus', 'not-started');

      this.set('uploading', true);
      this.set('waitingMessage', 'Saving your submission');

      /*
       * Note for the code below, but also Ember in general::::
       * Seems that calling `obj.set('prop', obj2)` must be used in the case of:
       *    obj.prop: belongsTo('obj2')
       * Where calling `obj.set('prop', obj2.get('id'))` will not set the relationship
       */

      this.get('model.publication').save().then((p) => {
        sub.set('publication', p);
        let ctr = 0;
        let len = this.get('filesTemp').length;
        sub.save().then((s) => {
          // For each file, load it as buffer, POST it to the submission object's URI, then generate
          // a File object in fedora that references the file blob.
          if (this.get('filesTemp.length') == 0) {
            this.send('finishSubmission', s);
            return;
          }
          this.get('filesTemp').forEach((file) => {
            var reader = new FileReader();
            reader.readAsArrayBuffer(file.get('_file'));
            reader.onload = (evt) => {
              let data = evt.target.result;
              // begin XHR setup
              let xhr = new XMLHttpRequest();
              xhr.open('POST', `${s.get('id')}`, true);
              xhr.setRequestHeader('Content-Disposition', `attachment; filename="${encodeURI(file.get('name'))}"`);
              let contentType = file.get('_file.type') ? file.get('_file.type') : 'application/octet-stream';
              xhr.setRequestHeader('Content-Type', contentType);
              if (ENV.environment === 'travis' || ENV.environment === 'development') xhr.withCredentials = true;
              if (ENV.environment === 'development') xhr.setRequestHeader('Authorization', 'Basic YWRtaW46bW9v');
              // end XHR setup
              this.set('waitingMessage', 'Uploading files');
              xhr.onload = (results) => {
                file.set('submission', s);
                file.set('uri', results.target.response);
                file.save().then((f) => {
                  if (f) {
                    ctr += 1;
                    // once every file is uploaded:
                    if (ctr >= len) {
                      this.send('finishSubmission', s);
                    }
                  } else {
                    toastr.error('It looks like one or more of your files failed to upload. Please try again or contact support.');
                  }
                }).catch((e) => {
                  this.set('uploading', false);
                  toastr.error(e);
                });
              };
              xhr.send(data);
            };
            reader.onerror = function (evt) {
              this.set('uploading', false);
              toastr.error('Error reading file');
            };
          });
        }).catch((e) => {
          this.set('uploading', false);
          toastr.error(e);
        });
      });
    }
  }
});
