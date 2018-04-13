import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';

export default Route.extend({
  localSubmission: storageFor('submission'),

  model() {
    let newSubmission = null;
    if (this.get('localSubmission.submission')) {
      newSubmission = this.get('store').createRecord('submission',
        this.get('localSubmission.submission'));
    } else {
      newSubmission = this.get('store').createRecord('submission');
    }
    let repositories = this.get('store').findAll('repository');
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
