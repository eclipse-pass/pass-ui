import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    submission: {},
    register: () => { },
    init() {
        this._super(...arguments);

        let register = this.get('register');
        var self = this;

        register(function () {
            return self.get('store').createRecord('deposit', {
                repository: 'DOE-PAGES',
                status: 'new'
            });
        });
    }
});
