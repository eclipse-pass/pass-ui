import Controller from '@ember/controller';

export default Controller.extend({
  parent: Ember.inject.controller('submissions.new'),
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
