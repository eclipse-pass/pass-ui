import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  preLoadedGrant: alias('model.preLoadedGrant'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  parent: controller('submissions.new'),

  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.policies');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.basics');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      this.get('submission').save().then(() => this.transitionToRoute(gotoRoute));
    },
    abort() {
      this.get('parent').send('abort');
    }
  }
});
