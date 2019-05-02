import Component from '@ember/component';

export default Component.extend({
  actions: {
    toggle() {
      const repo = this.get('repository');
      const type = this.get('type');
      const selected = event.target.checked;
      debugger
      this.sendAction('toggleRepository', repo, selected, type);
    }
  }
});
