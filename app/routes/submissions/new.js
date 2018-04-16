import Route from '@ember/routing/route';
import {
  storageFor
} from 'ember-local-storage';
const {
  service
} = Ember.inject;

export default Route.extend({
  localSubmission: storageFor('submission'),
  currentUser: service(),

  model() {
    // debugger;
    let newSubmission = null;
    let submissionDraft = this.get('currentUser.user.person.submissionDraft');
    if (submissionDraft.content !== null) {
      newSubmission = this.get('currentUser.user.person.submissionDraft');
    } else {
      newSubmission = this.get('store').createRecord('submission');
    }
    let repositories = this.get('store').findAll('repository');
    let grants = this.get('store').findAll('grant', {
      include: 'funder'
    });
    let policies = this.get('store').findAll('policy');
    let journals = this.get('store').findAll('journal');
    let h = Ember.RSVP.hash({
      repositories,
      newSubmission,
      grants,
      policies,
      journals
    });
    return h;
  },
});
