import Component from '@ember/component';
import { storageFor } from 'ember-local-storage';

export default Component.extend({
  localSubmission: storageFor('submission'),
  stepInPercent: Ember.computed('localSubmission.step', function() {
   return (this.get('localSubmission.step')/6)*100;
 }),
 actions: {
   incStep() {
     this.incrementProperty('localSubmission.step');
   },
   decStep() {
     this.decrementProperty('localSubmission.step');
   }
 }
});
