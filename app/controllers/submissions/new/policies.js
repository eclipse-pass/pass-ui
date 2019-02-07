import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  policies: alias('model.policies'),
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
