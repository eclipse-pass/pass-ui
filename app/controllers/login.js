import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    login() {
      // TODO Handle error conditions

      this.get('session').login(this.get('username'));

      // TODO Go to previous route
      this.transitionToRoute('dashboard')
    }
  }
});
