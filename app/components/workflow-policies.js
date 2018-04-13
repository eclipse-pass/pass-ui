import Component from '@ember/component';

export default Component.extend({

      depositGenerators: [],

      actions: {
        next() {
          this.sendAction('next')
        },
        back() {
          this.sendAction('back')
        },

        /** Saves the submission deposits that will establish compliance
         *
         * @returns {Promise} Save promise for the submission and deposits.
        */
        saveAll() {
            var submission = this.get('model.newSubmission');
            var linkedDeposits = submission.get('deposits');
            var depositGenerators = this.get('depositGenerators');
            var newDeposits = [];

            while (depositGenerators.length) {
                let deposit = (depositGenerators.pop())();
                if (deposit) {
                    newDeposits.push(deposit);
                }
            }

            var newRepos = newDeposits.map(deposit => deposit.get('repository'));

            // Remove linked deposits whose repos are not in the 'new' list,
            // and are not requested
            var toRemoveFromLinked = linkedDeposits.filter(deposit => !newRepos.includes(deposit.get('repository')) && !deposit.get('requested'));

            toRemoveFromLinked.forEach(deposit => linkedDeposits.removeObject(deposit))

            var linkedRepos = linkedDeposits.map(deposit => deposit.get('repository'));

            var toLink = newDeposits.filter(deposit => !(linkedRepos.includes(deposit.get('repository'))));

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
         * TODO It actually returns a list of _repository names_, which is easier to deal
         * with under time constraints for producing the 12/17 demo.  In reality, policy
         * should probably be modelled as an object.
         *
         * @returns {Array<string>}
         */
        getPolicies() {
            return this.get('model.newSubmission')
                .get('grants')
                .map(grant => grant.get('funder'))
                .map(funder => funder.get('repository'))
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
         * @param {Function} depositGenerator
        */
        registerDeposit(depositGenerator) {
            if (depositGenerator) {
                this.get('depositGenerators').push(depositGenerator);
            }
        }

      }
  });
