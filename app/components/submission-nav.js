import Component from '@ember/component';

export default Component.extend({
  actions: {
    incStep() {
      this.incrementProperty('step');
    },
    decStep() {
      this.decrementProperty('step');
    },
  },
});
