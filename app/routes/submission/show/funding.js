import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

    actions: {
        pushInto(target, obj) {
            return target.pushObject(obj);
        } 
    },

    model() {
        return this.modelFor("submission.show");
    }
});
