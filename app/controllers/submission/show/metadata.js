import Controller from '@ember/controller';

export default Controller.extend({

    actions: {
        filterWorkflowStep(name) {
            let submission = this.get('model');
            var repos = submission.get('deposits').map(deposit => deposit.get('repo'));
            console.log('repos are ' + repos);

            if (name === 'common' && repos.length) {
                console.log("allowing " + name);
                return name;
            } else if (repos.includes(name)) {
                console.log("allowing " + name);
                return name;
            }

            console.log("NOT allowing " + name);
        }
    }
});