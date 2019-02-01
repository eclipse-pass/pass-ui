import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.metadata');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.policies');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
