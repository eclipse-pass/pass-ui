import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['grant'],
  actions: {
    submit() {
      const sub = this.get('model.newSubmission');
      const pub = this.get('model.publication');
      sub.status = 'PND';
      sub.abstract = 'No Abstract';
      sub.dateSubmitted = new Date();
      sub.submitted = true;
      pub.save().then((p) => {
        sub.publication = p;
        sub.save().then(() => {
          this.transitionToRoute('thanks');
        });
      });
    },
  },
});
