import Controller from '@ember/controller';

export default Controller.extend({

    depositGenerators: [],

    actions: {
        
        /** Saves the submission deposits that will establish compliance 
         * 
         * @returns {Promise} Save promise for the submission and deposits.
        */
        saveAll() {
            var submission = this.get('model');
            var linkedDeposits = submission.get('deposits');
            var depositGenerators = this.get('depositGenerators');
            var newDeposits = [];

            while (depositGenerators.length) {
                let deposit = (depositGenerators.pop())();
                // Don't add the deposit if it goes to a repository that is already present
                if (deposit) {
                    newDeposits.push(deposit);
                }
            }

            var newRepos = newDeposits.map(deposit => deposit.get('repo'));

            // Remove linked deposits whose repos are not in the 'new' list,
            // and are not requested
            var toRemoveFromLinked = linkedDeposits.filter(deposit => !newRepos.includes(deposit.get('repo')) && !deposit.get('requested'));

            toRemoveFromLinked.forEach(deposit => linkedDeposits.removeObject(deposit))

            var linkedRepos = linkedDeposits.map(deposit => deposit.get('repo'));

            var toLink = newDeposits.filter(deposit => !(linkedRepos.includes(deposit.get('repo'))));

            return Promise.all(newDeposits.map(newDeposit => {
                if (toLink.includes(newDeposit)) {
                    linkedDeposits.pushObject(newDeposit);
                    return newDeposit.save();
                } else {
                    return new Promise(() => newDeposit.rollbackAttributes());
                }
            })).then(() => submission.save())
            .then(() => Promise.all(toRemoveFromLinked.map(deposit => deposit.destroyRecord())));

        },

        /** Generate the list of policies implied by the awards that funded this submission.
         * 
         * For now, all submissions that go throught this system must comply with the JHU
         * policy, so this policy is always added to the list of policies returned by 
         * this function.
         * 
         * TODO It actually returns a list of _repository names_, which is easier to deal
         * with under time constraints for producing the 12/17 demo.  In reality, policy
         * should probably be modelled as an object.
         * 
         * @returns {Array<string>}
         */
        getPolicies() {
            // TODO bad work-around that sort of clears 'depositGenerators' every time
            // this step is rendered, so that it will always contain only information
            // from the current render.
            this.set('depositGenerators', []);
            let repos = this.get('model')
                .get('grants')
                .map(grant => grant.get('funder'))
                .map(funder => funder.get('repo'));
            repos.push("JHU-IR");   // Hard code JScholarship in for now
            // Remove duplicate entries, in case multiple awards go to the same repo
            repos = repos.filter((el, i, arr) => arr.indexOf(el) == i);
            return repos;
        },

        /** Register a deposit in order to comply with a policy 
         * 
         * This is called by compliance components; they generate a _function_
         * which, when invoked, produces a deposit for any repositories that
         * will result in compliance; or null if no such deposit is necessary.
         * 
         * Upon "save", these deposits are attached to the submission.
         * 
         * @param {Function} depositGenerator
        */
        registerDeposit(depositGenerator) {
            if (depositGenerator) {
                this.get('depositGenerators').push(depositGenerator);
            }
        }

    }
});
