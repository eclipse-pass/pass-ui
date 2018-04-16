import Route from '@ember/routing/route';
import {
  storageFor,
} from 'ember-local-storage';

const {
  service,
} = Ember.inject;

export default Route.extend({
  localSubmission: storageFor('submission'),
  currentUser: service(),

  model() {
    // debugger;
    let newSubmission = null;
    const submissionDraft = this.get('currentUser.user.person.submissionDraft');
    if (submissionDraft.content !== null) {
      newSubmission = this.get('currentUser.user.person.submissionDraft');
    } else {
      newSubmission = this.get('store').createRecord('submission');
    }
    const repositories = this.get('store').findAll('repository');
    const grants = this.get('store').findAll('grant', {
      include: 'funder',
    });
    const policies = this.get('store').findAll('policy');
    const journals = this.get('store').findAll('journal');
    const h = Ember.RSVP.hash({
      repositories,
      newSubmission,
      grants,
      policies,
      journals,
    });
    return h;
  },
});
