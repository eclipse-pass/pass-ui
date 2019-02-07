import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  preLoadedGrant: alias('model.preLoadedGrant'),
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
