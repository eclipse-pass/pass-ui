import Controller from '@ember/controller';

export default Controller.extend({

    depositGenerators: [],

    actions: {

        /** Saves the submission deposits that will establish compliance */
        saveAll() {
            var submission = this.get('model');
            var deposits = submission.get('deposits');
            var depositGenerators = submission.get('depositGenerators');

            /* TODO:  Do something more elegant. We just delete prior content, and replace */
            while (deposits.length) {
                deposits.popObject().destroyRecord();
            }

            while (depositGenerators.length) {
                var deposit = (depositGenerators.pop())();
                deposits.pushObject(deposit);
                deposit.save();
            }

            submission.save();
        }, 

        /** Generate the list of policies implied by the awards that funded this submission.
         * 
         * TODO It actually returns a list of _repository names_, which is easier to deal
         * with under time constraints for producing the 12/17 demo.  In reality, policy
         * should probably be modelled as an object.
         * 
         * @returns {Array<string>}
         */
        getPolicies() {
           return this.get('model')
                .get('grants')
                .map(grant => grant.get('funder'))
                .map(funder => funder.get('repo'))
                .filter((e, i, arr) => {
                    return i === arr.indexOf(e)
                });
        }, 

        /** Register a deposit in order to comply with a policy 
         * 
         * This is called by compliance components; they generate a deposit
         * entity for any repositories that will result in compliance.
         * 
         * Upon "save", these deposits are attached to the submission.
         * 
         * @param generateDeposit {function<DS.Model::deposit>}
        */
        registerDeposit(generateDeposit) {
            this.get('registeredDeposits').push(generateDeposit);
        }

    }
});
