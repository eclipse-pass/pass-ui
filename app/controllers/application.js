import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    logout() {
      this.get('session').logout();
      this.transitionToRoute('application');
    }
  }
});
