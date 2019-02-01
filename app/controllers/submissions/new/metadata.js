import Controller from '@ember/controller';

export default Controller.extend({
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
