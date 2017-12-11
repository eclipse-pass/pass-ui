import Controller from '@ember/controller';

export default Controller.extend({

    depositGenerators: [],

    actions: {

        /** Saves the submission deposits that will establish compliance */
        saveAll() {
            var submission = this.get('model');
            var linkedDeposits = submission.get('deposits');
            var depositGenerators = this.get('depositGenerators');
            var newDeposits = [];

            while (depositGenerators.length) {
                var deposit = (depositGenerators.pop())();
                if (deposit) {
                    newDeposits.push(deposit);
                }
            }

            var newRepos = newDeposits.map(deposit => deposit.get('repo'));

            // Remove linked deposits whose repos are not in the 'new' list,
            // and are not requested
            var toRemoveFromLinked = linkedDeposits.filter(deposit => !newRepos.includes(deposit.get('repo')) && !deposit.get('requested'));

            for (var deposit of toRemoveFromLinked) {
                linkedDeposits.removeObject(deposit);
                deposit.destroy();
            }

            var linkedRepos = linkedDeposits.map(deposit => deposit.get('repo'));

            var toLink = newDeposits.filter(deposit => !(linkedRepos.includes(deposit.get('repo'))));

            for (var deposit of newDeposits) {
                if (toLink.includes(deposit)) {
                    linkedDeposits.pushObject(deposit);
                    deposit.save().then(submission.save());
                } else {
                    deposit.rollbackAttributes();
                }
            }
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
         * This is called by compliance components; they generate a _function_
         * which, when invoked, produces a deposit for any repositories that
         * will result in compliance; or null if no such deposit is necessary.
         * 
         * Upon "save", these deposits are attached to the submission.
         * 
         * @param generateDeposit {function<DS.Model::deposit>}
        */
        registerDeposit(depositGenerator) {
            if (depositGenerator) {
                this.get('depositGenerators').push(depositGenerator);
            }
        }

    }
});
