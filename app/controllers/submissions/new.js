import Controller from '@ember/controller';

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
        sub.set('publication', p);
        let ctr = 0;
        let len = JSON.parse(this.get('filesTemp')).length;
        sub.set('removeNIHDeposit', false);
        sub.save().then((s) => {
          JSON.parse(this.get('filesTemp')).forEach((file) => {
            let fileData = file.blob;
            let contentType = file.mimeType ? file.mimeType : 'application/octet-stream';
            $.ajaxSetup({
              beforeSend(xhr) {
                // Set the headers
                xhr.setRequestHeader('Content-Disposition', `attachment; filename="${file.name}"`);
                xhr.setRequestHeader('Content-Type', contentType);
                xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
                xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with, x-requested-by');

              }
            });
            $.post(`${s.id}`, {
              data: fileData,
            }).done((results) => {
              debugger;
              let newFile = this.get('store').createRecord('file', file);
              newFile.set('submission', s);
              newFile.save().then(() => {
                ctr += 1;
                console.log(ctr);
                console.log('saved file!');
                if (ctr >= len) {
                  this.transitionToRoute('thanks');
                }
              });
            });
          });
        });
      });
    },
  },
});
