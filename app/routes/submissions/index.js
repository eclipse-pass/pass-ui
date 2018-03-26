import Route from '@ember/routing/route';
import AuthenticateRouteMixin from '../../mixins/authenticate-route-mixin';

export default Route.extend(AuthenticateRouteMixin, {
    model() {
        return this.get('store').findAll('submission');
      }
});