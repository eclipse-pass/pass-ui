import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  repositories: alias('model.repositories'),
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
