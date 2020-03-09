import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  submission: alias('model.newSubmission'),
  files: alias('model.files'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  parent: controller('submissions.new'),
  waitingMessage: computed('parent.waitingMessage', function () {
    return this.get('parent').get('waitingMessage');
  }),
  uploading: computed('parent.uploading', function () {
    return this.get('parent').get('uploading');
  }),
  comment: computed('parent.comment', {
    get(key) {
      return this.get('parent').get('comment');
    },
    set(key, value) {
      this.get('parent').set('comment', value);
      return value;
    }
  }),
  actions: {
    loadPrevious() {
      this.send('loadTab', 'submissions.new.files');
    },
    loadTab(gotoRoute) {
      // add validation, processing
      // this.get('submission').save().then(() => this.transitionToRoute(gotoRoute));
      this.transitionToRoute(gotoRoute);
    },
    submit() {
      this.get('parent').send('submit');
    },
    abort() {
      this.get('parent').send('abort');
    }
  }
});
