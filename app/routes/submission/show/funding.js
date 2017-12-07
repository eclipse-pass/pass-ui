import Route from '@ember/routing/route';

export default Route.extend({

    actions: {
        pushInto(target, obj) {
            return target.pushObject(obj);
        } 
    }
});
