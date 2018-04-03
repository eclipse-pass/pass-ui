import Controller from '@ember/controller';
import config from '../config/environment'

export default Controller.extend({
  rootURL: config.rootURL,
  institution: '',
  didRender() {
    this.set('institution' , this.store.find('institution'));
  },
  actions: {
    logout() {
      this.get('session').logout();
      this.transitionToRoute('login');
    }
  },
});
