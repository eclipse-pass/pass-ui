import Component from '@ember/component';

export default Component.extend({
  actions: {
    next() {
      this.sendAction('next')
    },
    back() {
      this.sendAction('back')
    },
  }
});
