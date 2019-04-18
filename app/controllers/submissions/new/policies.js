import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  policies: alias('model.policies'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  parent: Ember.inject.controller('submissions.new'),

  actions: {
    loadNext() {
      this.send('loadTab', 'submissions.new.repositories');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.grants');
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
