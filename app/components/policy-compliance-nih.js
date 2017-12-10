import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    submission: {},
    register: () => {},
    method: "D",
    needsDeposit: true,

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
        if (pmcMethod) {
            this.set('method', pmcMethod);
        }

        console.log("method: " + pmcMethod);
        register(function() {
            // A never needs deposit, C, D does.  B depends on user input.
            if (pmcMethod === 'A') {
                this.set('needsDeposit', false);
            } else if (pmcMetod === 'C' || pmcMethod === 'D') {
                this.set('needsDeposit', true);
            }

            if (this.get('needsDeposit')) {
                return this.get('store').createRecord('deposit', {
                    repo: 'PMC',
                    status: 'new'
                });
            }
        });
    },

    actions: {
        /** Specify whether a deposit is necessary */
        setNeedsDeposit(val) {
            this.set('needsDeposit', val);
        }
    }

});
