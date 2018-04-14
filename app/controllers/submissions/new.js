import Controller from '@ember/controller';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  actions: {
    submit() {
      const sub = this.get('model.newSubmission');
      const currentUser = this.get('currentUser.user.person');
      debugger;
      sub.status = 'PND'
      sub.abstract = "No Abstract"
      sub.dateSubmitted = new Date();
      sub.set('createdBy', currentUser);
      debugger;
      sub.save().then((submission) => {
        submission.get('deposits').forEach((deposit) => {
          deposit.save();
        });
      });
    }
  },
});
