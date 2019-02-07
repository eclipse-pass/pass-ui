import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  publication: alias('model.publication'),
  preLoadedGrant: alias('model.preLoadedGrant'),
  submissionEvents: alias('model.submissionEvents'),
  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.grants');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.transitionToRoute(gotoRoute);
    }
  }
});
