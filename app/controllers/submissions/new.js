import Controller from '@ember/controller';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  actions: {
    submit() {
      const sub = this.get('model.newSubmission');
      const currentUser = this.get('currentUser.user.person');
      sub.status = 'PND'
      sub.abstract = "No Abstract"
      sub.dateSubmitted = new Date();
      sub.set('createdBy', currentUser);
      let depositsSaved = 0;
      sub.save().then((submission) => {
        submission.get('deposits').forEach((deposit, index, arr) => {
          deposit.save().then((deposit) => {
            depositsSaved += 1;
            console.log('deposits saved: ', depositsSaved);
            if (depositsSaved === arr.get('length')) {
              this.transitionToRoute('thanks');
            }
          });
        });
      });
    }
  },
});
