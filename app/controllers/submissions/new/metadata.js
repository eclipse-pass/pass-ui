import Controller from '@ember/controller';

export default Controller.extend({
  parent: Ember.inject.controller('submissions.new'),
  didNotAgree: Ember.computed('parent.didNotAgree', function () {
    return this.get('parent').get('didNotAgree');
  }),
  hasProxy: Ember.computed('parent.hasProxy', function () {
    return this.get('parent').get('hasProxy');
  }),
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.files');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.repositories');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
