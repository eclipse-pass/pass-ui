import Controller from '@ember/controller';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  actions: {
    submit() {
      const sub = this.get('model.newSubmission');
      const currentUser = this.get('currentUser.user');
      sub.status = 'PND';
      sub.abstract = 'No Abstract';
      sub.dateSubmitted = new Date();
      sub.submitted = true;
      sub.save().then((submission) => {
        this.transitionToRoute('thanks');
      });
    },
  },
});
