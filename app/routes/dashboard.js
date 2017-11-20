import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    let loginController = this.controllerFor('login');

    if (!loginController.get('session.authenticated')) {
      loginController.set('loginTransition', 'dashboard');
      this.transitionTo('login');
    }
   }
});
