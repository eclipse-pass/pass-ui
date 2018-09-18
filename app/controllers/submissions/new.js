import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  queryParams: ['grant', 'submission'],
  tempFiles: Ember.A(),
  didNotAgree: false, // JHU included as a repository but removed before review because deposit agreement wasn't accepted
  submitterEmail: '',
  submitterName: '',
  comment: '',
  hasProxy: Ember.computed('submitterEmail', 'model.newSubmission.preparers', function () {
    return this.get('submitterEmail') || this.get('model.newSubmission.preparers');
  }),
  actions: {
    submit() {
      if (this.get('didNotAgree')) {
        let jhuRepo = that.get('model.newSubmission.repositories').filter(repo => repo.get('name') === 'JScholarship');
        if (jhuRepo.length > 0) {
          jhuRepo = jhuRepo[0];
          that.get('model.newSubmission.repositories').removeObject(jhuRepo);
        }
      }
      const sub = this.get('model.newSubmission');
      sub.set('repositories', sub.get('repositories').filter((repo) => { // eslint-disable-line
        // TODO the specific URL checks should be removed after Repository data is updated to
        // include 'integrationType' property
        return repo.get('integrationType') !== 'web-link' &&
          repo.get('url') !== 'https://eric.ed.gov/' &&
          repo.get('url') !== 'https://dec.usaid.gov/';
      }));

      this.set('model.uploading', true);
      this.set('model.waitingMessage', 'Saving your submission');
      /*
       * Note for the code below, but also Ember in general::::
       * Seems that calling `obj.set('prop', obj2)` must be used in the case of:
       *    obj.prop: belongsTo('obj2')
       * Where calling `obj.set('prop', obj2.get('id'))` will not set the relationship
       */
      const pub = this.get('model.publication');
      sub.set('aggregatedDepositStatus', 'not-started');
      sub.set('submittedDate', new Date());
      sub.set('submitted', false);
      if (!(sub.get('hasProxy'))) {
        sub.set('submitter', this.get('currentUser.user')); // this.get('currentUser.user.id') seems to break stuff
      }
      sub.set('source', 'pass');
      pub.save().then((p) => {
        sub.set('publication', p); // p.get('id') seems to break stuff
        let ctr = 0;
        let len = this.get('filesTemp').length;
        sub.set('removeNIHDeposit', false);
        sub.save().then((s) => {
          this.get('filesTemp').forEach((file) => {
            let contentType = file.get('_file.type') ? file.get('_file.type') : 'application/octet-stream';
            var reader = new FileReader();
            reader.readAsArrayBuffer(file.get('_file'));
            reader.onload = (evt) => {
              let data = evt.target.result;
              let xhr = new XMLHttpRequest();
              xhr.open('POST', `${s.get('id')}`, true);
              xhr.setRequestHeader('Content-Disposition', `attachment; filename="${encodeURI(file.get('name'))}"`);
              xhr.setRequestHeader('Content-Type', contentType);
              if (ENV.environment === 'travis' || ENV.environment === 'development') {
                xhr.withCredentials = true;
                if (ENV.environment === 'development') {
                  xhr.setRequestHeader('Authorization', 'Basic YWRtaW46bW9v');
                }
              }
              this.set('model.waitingMessage', 'Uploading files');
              xhr.onload = (results) => {
                file.set('submission', s); // s.get('id') seems to break stuff
                file.set('uri', results.target.response);
                file.save().then((f) => {
                  if (f) {
                    ctr += 1;
                    console.log(ctr);
                    if (ctr >= len) {
                      let subEvent = this.store.createRecord('submissionEvent');
                      subEvent.performedBy = this.get('currentUser.user');
                      subEvent.comment = this.get('comment');
                      subEvent.performedDate = new Date();
                      if (s.get('submitter') === this.get('currentUser.user')) {
                        s.set('submitted', true);
                        subEvent.performerRole = 'submitter';
                        sub.eventType = 'submitted';
                      } else {
                        s.set('status', 'approval-pending');
                        subEvent.performerRole = 'preparer';
                        if (s.get('submitter')) {
                          subEvent.eventType = 'approval-requested';
                        } else if (this.get('submitterName') && this.get('submitterEmail')) {
                          subEvent.eventType = 'approval-requested-newuser';
                          s.submitter = `mailto:${encodeURI(this.get('submitterEmail'))}`;
                          subEvent.link = `${ENV.rootURL}/submissions/${s.id}`;
                        }
                      }
                      s.save().then(() => {
                        this.set('model.uploading', false);
                        subEvent.save().then(() => {
                          this.transitionToRoute('thanks', { queryParams: { submission: s.get('id') } });
                        });
                      });
                    }
                  } else {
                    toastr.error('It looks like one or more of your files failed to upload. Please try again or contact support.');
                  }
                }).catch((e) => {
                  this.set('model.uploading', false);
                  toastr.error(e);
                });
              };
              xhr.send(data);
            };
            reader.onerror = function (evt) {
              this.set('model.uploading', false);
              toastr.error('Error reading file');
            };
          });
        });
      });
    },
  },
});
