import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthCallbackRoute extends Route {
  @service session;
  @service router;

  async beforeModel() {
    try {
      if (this.session.isAuthenticated) {
        const url = `${window.location.origin}/authenticated`;

        let response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.user.id === this.session.data.authenticated.user.id) {
          this.transitionTo('dashboard');
        } else {
          await this.session.invalidate();
        }
      } else {
        await this.session.authenticate('authenticator:http-only');
      }
    } catch (error) {
      window.location.replace(`${window.location.origin}/logout`);
    }
  }
}
