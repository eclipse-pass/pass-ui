import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service('current-user'),
  isPreparer: Ember.computed('currentUser', 'record', function () {
    let userId = this.get('currentUser.user.id');
    let preparers = this.get('record.preparers');
    return preparers.map(x => x.id).includes(userId);
  }),
  isSubmitter: Ember.computed('currentUser', 'record', function () {
    return this.get('currentUser.user.id') === this.get('record.submitter.id');
  })
});
