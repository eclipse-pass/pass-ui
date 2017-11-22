import Mixin from '@ember/object/mixin';

// Add to a route to ensure access is authenticated
export default Mixin.create({
  beforeModel(transition) {
    let loginController = this.controllerFor('login');

    if (!loginController.get('session.authenticated')) {
      loginController.set('previousTransition', transition);
      this.transitionTo('login');
    }
   }
});
