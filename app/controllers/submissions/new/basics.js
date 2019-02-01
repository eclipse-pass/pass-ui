import Controller from '@ember/controller';

export default Controller.extend({
  parent: Ember.inject.controller('submissions.new'),
  submitterName: Ember.computed('parent.submitterName', {
    get(key) {
      return this.get('parent').get('submitterName');
    },
    set(key, value) {
      this.get('parent').set('submitterName', value);
      return value;
    }
  }),
  submitterEmail: Ember.computed('parent.submitterEmail', {
    get(key) {
      return this.get('parent').get('submitterEmail');
    },
    set(key, value) {
      this.get('parent').set('submitterEmail', value);
      return value;
    }
  }),
  hasProxy: Ember.computed('parent.hasProxy', function () {
    return this.get('parent').get('hasProxy');
  }),
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.grants');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
