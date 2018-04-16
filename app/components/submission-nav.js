import Component from '@ember/component';
import { storageFor } from 'ember-local-storage';

export default Component.extend({
  localSubmission: storageFor('submission'),
  stepInPercent: Ember.computed('step', function () {
    return (this.get('step') / 6) * 100;
  }),
  actions: {
    incStep() {
      this.incrementProperty('step');
    },
    decStep() {
      this.decrementProperty('step');
    },
  },
});
