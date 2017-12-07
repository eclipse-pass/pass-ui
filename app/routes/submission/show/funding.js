import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

    actions: {
        pushInto(target, obj) {
            return target.pushObject(obj);
        } 
    },

    model() {
        var submission = this.modelFor("submission.show");
        return RSVP.hash({
            submission: submission,
            workflow: submission.get('workflows')
            .then(workflows => workflows.find(workflow => workflow.get('name') === 'funding'))
        })
    }
});
