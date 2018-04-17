import Component from '@ember/component';

export default Component.extend({
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
