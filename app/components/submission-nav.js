import Component from '@ember/component';

export default Component.extend({
  actions: {
    incStep() {
      this.incrementProperty('step');
    },
    decStep() {
      this.decrementProperty('step');
    },
    changeStep(step) {
      if (step <= this.get('maxStep')) {
        this.set('step', step);
      }
    }
  },
  didRender() {
    this._super(...arguments);
    window.scrollTo(0, 0);
  }
});
