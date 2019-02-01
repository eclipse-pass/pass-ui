import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.repositories');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.grants');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
