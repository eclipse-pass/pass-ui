import Controller from '@ember/controller';

export default Controller.extend({
  previousTransition: null,
  loginFailed: false,

  actions: {
    login() {
      this.set('loginFailed', false);

      let user = this.get('username');
      let pass = this.get('password');

      this.get('session').login(user, pass).then(() => {
        if (this.get('session.authenticated')) {
          let previousTransition = this.get('previousTransition');

          if (previousTransition) {
            this.set('previousTransition', null);
            previousTransition.retry();
          } else {
            this.transitionToRoute('index');
          }
        } else {
          this.set('loginFailed', true);
        }
      }, () => {
        this.set('loginFailed', true);
      });
    }
  }
});
