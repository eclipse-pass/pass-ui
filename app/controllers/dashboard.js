import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
  isSubmitter: Ember.computed('currentUser', function () {
    return this.get('currentUser.user.roles').includes('submitter');
  }),
});
