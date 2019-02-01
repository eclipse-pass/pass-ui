import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.policies');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.basics');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
