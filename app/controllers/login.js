import Controller from '@ember/controller';

export default Controller.extend({
  loginTransition: 'dashboard',
  loginFailed: false,

  actions: {
    login() {
      this.set('loginFailed', false);

      this.get('session').login(this.get('username')).then(() => {
        if (this.get('session.authenticated')) {
          this.transitionToRoute(this.get('loginTransition'));
        } else {
          this.set('loginFailed', true);
        }
      });
    }
  }
});
