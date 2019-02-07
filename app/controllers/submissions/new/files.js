import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  files: alias('model.files'),
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
