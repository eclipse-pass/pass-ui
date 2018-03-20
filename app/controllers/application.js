import Controller from '@ember/controller';
import config from '../config/environment'

export default Controller.extend({
  rootURL: config.rootURL,
  actions: {
    logout() {
      this.get('session').logout();
      this.transitionToRoute('application');
    }
  },
});
