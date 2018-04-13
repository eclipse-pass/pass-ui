import Component from '@ember/component';

export default Component.extend({
  stepInPercent: Ember.computed('step', function() {
   return (this.step/6)*100
 })
});
