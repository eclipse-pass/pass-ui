import Component from '@ember/component';

export default Component.extend({
  actions: {
    cancel() {
      this.sendAction('abort');
    }
  }
});
