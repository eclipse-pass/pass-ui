import Controller from '@ember/controller';

export default Controller.extend({
  parent: Ember.inject.controller('submissions.new'),
  waitingMessage: Ember.computed('parent.waitingMessage', function () {
    return this.get('parent').get('waitingMessage');
  }),
  uploading: Ember.computed('parent.uploading', function () {
    return this.get('parent').get('uploading');
  }),
  comment: Ember.computed('parent.comment', {
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
      this.transitionToRoute(gotoRoute);
    },
    submit() {
      this.get('parent').send('submit');
    }
  }
});
