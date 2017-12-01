import Route from '@ember/routing/route';
import AuthenticateRouteMixin from '../mixins/authenticate-route-mixin';

export default Route.extend(AuthenticateRouteMixin, {
    actions: {
        transitionTo(route, model) {
            this.transitionTo(route, model);
        }
    }
});
