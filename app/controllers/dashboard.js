import Controller from '@ember/controller';

export default Controller.extend({
  currentUser: Ember.inject.service('current-user'),
});
