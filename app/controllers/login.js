import Controller from '@ember/controller';

export default Controller.extend({
  previousTransition: null,
  loginFailed: false,

  actions: {
    login() {
      this.set('loginFailed', false);

      this.get('session').login(this.get('username')).then(() => {
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
      });
    }
  }
});
