import Route from '@ember/routing/route';

export default Route.extend({
    model() {
      let repositories = this.get('store').findAll('repository');
      let newSubmission = this.get('store').createRecord('submission');
      let grants = this.get('store').findAll('grant');
      let policies = this.get('store').findAll('policy');
      let journals = this.get('store').findAll('journal');
      return Ember.RSVP.hash({
        repositories,
        newSubmission,
        grants,
        policies,
        journals
      });
    }
});
