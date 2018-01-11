import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    // TODO Access control to grants data should be enforced on backend?

    let store = this.get('store');
    let session = this.controllerFor('login').get('session');

    if (session.get('isAdmin')) {
      return store.findAll('grant');
    } else if (session.get('isPI')) {
      return store.query('grant', {creator: session.get('user.id')});
    }
  }
});
