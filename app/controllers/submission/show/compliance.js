import Controller from '@ember/controller';

export default Controller.extend({

    depositGenerators: [],

    actions: {

        /** Saves the submission deposits that will establish compliance */
        saveAll() {
            var submission = this.get('model');
            var deposits = submission.get('deposits');
            var depositGenerators = this.get('depositGenerators');

            

            /* TODO:  Do something more elegant. We just delete prior content, and replace */
            
            /* TODO;  Figure out how the hell to find lengths of the
             * PromiseArrays returned by ember-data.  length is supposed to be 
             * a property.  What it contains is a mystery.  It's not a number, 
             * it's some sort of object ¯\_(ツ)_/¯
             * 
             * So this simple loop is more complicated than it has to be.
             */
            while (deposits.length) {
                let deposit = deposits.popObject();

                if (deposit) {
                    deposit.destroyRecord();
                } else {
                    break;
                }
            }

            while (depositGenerators.length) {
                var deposit = (depositGenerators.pop())();
                if (deposit) {
                    deposits.pushObject(deposit);
                    deposit.save();
                }
            }

            //TODO: This fails for some reason.  No idea why.  Something is null or undefined
            //somewhere.  No idea what. 
            //submission.save();
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
