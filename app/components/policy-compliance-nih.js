import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    submission: {},
    register: () => {},

    /** When component initializes, create and register a deposit-generating function.
     * 
     * The regisistered "deposit generating function" registered here
     * generates a Deposit entity necessary for compliance with the
     * NIH open access policy.
    */
    init() {
        this._super(...arguments);

        let submission = this.get('submission');
        let  register = this.get('register');

        var pmcMethod = submission.get('journal').get('pmcParticipation');

        console.log("method: " + pmcMethod);
        register(function() {

        });

    }
});
