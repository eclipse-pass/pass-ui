import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    submit() {
      const sub = this.get('model');
      sub.save();
    }
  }
});
