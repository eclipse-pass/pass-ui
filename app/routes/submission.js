import Route from '@ember/routing/route';
import AuthenticateRouteMixin from '../mixins/authenticate-route-mixin';

export default Route.extend(AuthenticateRouteMixin, {
  beforeModel() {
    this.transitionTo('submission.new'); // Implicitly aborts the on-going transition.
  }
});
