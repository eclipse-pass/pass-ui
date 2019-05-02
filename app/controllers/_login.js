import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service('session'),
  actions: {
    authenticate() {
      const { username, password } = this.getProperties('username', 'password');
      this.get('session').authenticate('authenticator:drf-token-authenticator', username, password).catch((reason) => {
        this.set('error', reason);
      }).then(() => this.transitionToRoute('dashboard'));
    },
  },
});
