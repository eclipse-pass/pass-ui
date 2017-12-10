import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    submission: {},
    register: () => { },
    init() {
        this._super(...arguments);

        let submission = this.get('submission');
        let register = this.get('register');

        register(function () {
            return this.get('store').createRecord('deposit', {
                repo: 'DOE-PAGES',
                status: 'new'
            });
        });
    }
});
