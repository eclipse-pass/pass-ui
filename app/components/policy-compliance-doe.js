import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  submission: {},
  register: () => { },
  init() {
    this._super(...arguments);

    const register = this.get('register');
    const self = this;

    register(() => self.get('store').createRecord('deposit', {
      repo: 'DOE-PAGES',
      status: 'new',
    }));
  },
});
