import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  repositories: alias('model.repositories'),
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
