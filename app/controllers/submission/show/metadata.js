import Controller from '@ember/controller';

export default Controller.extend({

    actions: {
        filterWorkflowStep(name) {
            let submission = this.get('model');
            var repos = submission.get('deposits').map(deposit => deposit.get('repository'));

            if (name === 'common' && repos.length) {
                return name;
            } else if (repos.includes(name)) {
                return name;
            }
        }
    }
});
