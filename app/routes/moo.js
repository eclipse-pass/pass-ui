import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MooRoute extends Route {
  @service session;

  async activate() {
    try {
      await this.session.authenticate('authenticator:shibboleth');
    } catch (error) {
      this.session.invalidate();
    }

    if (this.session.isAuthenticated) {
      this.transitionTo('dashboard');
    }
  }
}
