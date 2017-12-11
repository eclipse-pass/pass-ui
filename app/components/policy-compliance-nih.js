import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

    willPay: false,
    noPay: computed('willPay', function () { return !this.get('willPay') }),

    store: service('store'),
    submission: {},
    register: () => { },
    method: "D",
    needsDeposit: false,

    /** When component initializes, create and register a deposit-generating function.
     * 
     * The regisistered "deposit generating function" registered here
     * generates a Deposit entity necessary for compliance with the
     * NIH open access policy.
    */
    init() {
        this._super(...arguments);

        let submission = this.get('submission');
        let register = this.get('register');

        var pmcMethod = submission.get('journal').get('pmcParticipation');
        if (pmcMethod) {
            this.set('method', pmcMethod);
        }

        this.set('needsDeposit', submission.get('deposits').map(deposit => deposit.get('repo')).includes("PMC"));

        var self = this;
        register(function () {
            // A never needs deposit, C, D does.  B depends on user input.

            if (pmcMethod === 'A') {
                self.set('needsDeposit', false);
            } else if (pmcMethod === 'C' || pmcMethod === 'D') {
                self.set('needsDeposit', true);
            }

            if (self.get('needsDeposit')) {
                console.log("Needs deposit, so offering PMC");
                return self.get('store').createRecord('deposit', {
                    repo: 'PMC',
                    status: 'new'
                });
            } else {
                console.log("No deposit needed");
            }
        });
    },

    didReceiveAttrs() {
        this._super(...arguments);

        let submission = this.get('submission');
        let deposits = submission.get('deposits');

        this.set('willPay', !(deposits.map(deposit => deposit.get('repo')).includes("PMC")));
    },

    actions: {
        /** Specify whether a deposit is necessary */
        setNeedsDeposit(val) {
            console.log("setNeedsDeposit: " + val);
            this.set('willPay', val);
            this.set('needsDeposit', val);
        }
    }

});
