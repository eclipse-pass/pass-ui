import Component from '@ember/component';

export default Component.extend({
  step: 1,
  hideWorkflowNext: false,
  actions: {
    next() {
      this.set('step', this.get('step') + 1);
    },
    back() {
      this.set('step', this.get('step') - 1);
    }
  }
});
