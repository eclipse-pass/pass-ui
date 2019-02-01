import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.review');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.metadata');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
