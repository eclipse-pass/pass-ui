import Route from '@ember/routing/route';

const {
  service,
} = Ember.inject;

export default Route.extend({
  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.set('grant', undefined);
    }
  },

  currentUser: service(),
  model(params) {
    let preLoadedGrant = null;
    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    let publication = this.get('store').createRecord('publication');
    let newSubmission = this.get('store').createRecord('submission');

    const repositories = this.get('store').findAll('repository');
    const grants = this.get('store').findAll('grant', {
      include: 'primaryFunder',
    });
    const policies = this.get('store').findAll('policy');
    const journals = this.get('store').findAll('journal');
    const h = Ember.RSVP.hash({
      repositories,
      newSubmission,
      publication,
      grants,
      policies,
      journals,
      preLoadedGrant
    });
    return h;
  },
  // deactivate() {
  //   debugger;
  //   this.get('store').unloadAll();
  // }
});
