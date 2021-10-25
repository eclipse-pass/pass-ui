import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthCallbackRoute extends Route {
  @service session;
  @service router;

  async beforeModel() {
    try {
      await this.session.authenticate('authenticator:http-only');
    } catch (error) {
      window.location.replace(`${window.location.origin}/logout`);
    }
  }
}
