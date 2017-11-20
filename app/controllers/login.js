import Controller from '@ember/controller';

export default Controller.extend({
  loginTransition: 'dashboard',

  actions: {
    login() {
      // TODO Handle error conditions

      this.get('session').login(this.get('username')).then(() => {
        if (this.get('session.authenticated')) {
          this.transitionToRoute(this.get('loginTransition'));
        }
      });
    }
  }
});
