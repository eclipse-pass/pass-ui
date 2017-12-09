import Controller from '@ember/controller';

export default Controller.extend({


        //return DS.PromiseArray.create({
        //  promise: this.get('grants')
        //    .then(grant => grant.get('funder'))
        //    .then()
        //});

    actions: {
        saveAll() {

        }, 

        agencies() {
           return this.get('model')
                .get('grants')
                .map(grant => grant.get('funder'))
                .map(funder => funder.get('repo'));
                //.filter((e, i, self) => i === self.indexOf(e));
        }

    }
});
