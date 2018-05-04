import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['grant'],
  actions: {
    submit() {
      const sub = this.get('model.newSubmission');
      const pub = this.get('model.publication');
      sub.set('aggregatedDepositStatus', 'not-started');
      sub.set('submittedDate', new Date());
      sub.set('submitted', true);

      pub.save().then((p) => {
        sub.set('publication', p);

        let ctr = 0;
        let len = JSON.parse(sub.get('filesTemp')).length;
        sub.save().then((s) => {
          JSON.parse(sub.get('filesTemp')).forEach((file) => {
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
    },
  },
});
