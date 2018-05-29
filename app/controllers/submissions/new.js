import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  queryParams: ['grant'],
  tempFiles: Ember.A(),
  didNotAgree: false, // JHU included as a repository but removed before review because deposit agreement wasn't accepted
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
      const pub = this.get('model.publication');
      sub.set('aggregatedDepositStatus', 'not-started');
      sub.set('submittedDate', new Date());
      sub.set('submitted', true);
      sub.set('user', this.get('currentUser.user'));
      pub.save().then((p) => {
        console.log('publication saved');
        sub.set('publication', p);
        let ctr = 0;
        let len = this.get('filesTemp').length;
        sub.set('removeNIHDeposit', false);
        sub.save().then((s) => {
          console.log('submission saved');
          this.get('filesTemp').forEach((file) => {
            let contentType = file.get('_file.type') ? file.get('_file.type') : 'application/octet-stream';
            var reader = new FileReader();
            reader.readAsArrayBuffer(file.get('_file'));
            reader.onload = (evt) => {
              let data = evt.target.result;
              let xhr = new XMLHttpRequest();
              xhr.open('POST', `${s.id}`, true);
              xhr.setRequestHeader('Content-Disposition', `attachment; filename="${file.get('name')}"`);
              xhr.setRequestHeader('Content-Type', contentType);
              if (ENV.environment === 'travis' || ENV.environment === 'development') {
                xhr.withCredentials = true;
                if (ENV.environment === 'development') {
                  xhr.setRequestHeader('Authorization', 'Basic YWRtaW46bW9v'); // TODO: should not be hardcoded
                }
              }
              xhr.onload = (results) => {
                console.log('file binary saved');
                file.set('submission', s);
                file.set('uri', results.target.response);
                file.save().then(() => {
                  console.log('file object saved');
                  ctr += 1;
                  console.log(ctr);
                  console.log('saved file!');
                  if (ctr >= len) {
                    this.transitionToRoute('thanks');
                  }
                });
              };
              xhr.send(data);
            };
            reader.onerror = function (evt) {
              alert('error reading file');
            };
          });
        });
      });
    },
  },
});
