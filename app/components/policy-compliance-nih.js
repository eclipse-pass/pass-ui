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

        if (!submission) {
            // Just so we don't have to mess with tests
            return;
        }

        var pmcMethod = submission.get('journal').get('pmcParticipation');
        if (pmcMethod) {
            this.set('method', pmcMethod);
        }

        // If we're method B, we can use use the presence of PMC to determine whether we generate
        // a deposit when our deposit-registering-function is invoked.
        if (pmcMethod ==='B' ) {
            this.set('needsDeposit', submission.get('deposits').map(deposit => deposit.get('repository')).includes("PMC"));
        }

        var self = this;
        register(function () {
            // A never needs deposit, C, D does.  B depends on user input.
            let mustDeposit = !pmcMethod || pmcMethod === 'C' || pmcMethod === 'D';
            let answerFromUser = pmcMethod === 'B' && self.get('needsDeposit');

            if (mustDeposit || answerFromUser) {
                return self.get('store').createRecord('deposit', {
                    repository: 'PMC',
                    status: 'new'
                });
            }
        });
    },

    didReceiveAttrs() {
        this._super(...arguments);

        let submission = this.get('submission');
        let deposits = submission.get('deposits');

        this.set('willPay', !(deposits.map(deposit => deposit.get('repository')).includes("PMC")));
    },

    actions: {
        /** Specify whether a deposit is necessary */
        setNeedsDeposit(val) {
            this.set('willPay', !val);
            this.set('needsDeposit', val);
        }
    }

});
