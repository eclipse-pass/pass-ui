import Route from '@ember/routing/route';

const {
  service,
} = Ember.inject;

export default Route.extend({
  currentUser: service(),
  model(params) {
    let preLoadedGrant = null;
    if(params.grant) {
       preLoadedGrant = this.get('store').findRecord('grant', params.grant)
    }

    let publication = this.get('store').createRecord('publication');
    // let newSubmission = null;
    // const submissionDraft = this.get('currentUser.user.submissionDraft');
    // if (submissionDraft.content !== null) {
    //   newSubmission = this.get('currentUser.user.submissionDraft');
    // } else {
    //   newSubmission = this.get('store').createRecord('submission');
    // }
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
});
