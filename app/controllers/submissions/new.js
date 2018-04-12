import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    submit() {
      console.log("Received action from wrapper! Saving model in route.");
      const sub = this.get('model');
      sub.save();
    }
  }
});
