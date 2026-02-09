/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('app-static-config') declare staticConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  queryParams = ['userToken'];

  /* Used as route-action in templates */
  @action
  back() {
    history.back();
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transitionTo(route: string, model: any) {
    this.router.transitionTo(route, model);
  }

  /**
   * If there is a userToken query parameter call the user service with that parameter
   * to ensure objects are updated in the backend before any queries are done.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async beforeModel(transition: any) {
    const userToken = transition.to.queryParams.userToken;

    if (!this.staticConfig.config) {
      await this.staticConfig.setupStaticConfig();
    }

    if (userToken) {
      return fetch(`/user/whoami?userToken=${encodeURIComponent(userToken)}`);
    }
  }

  /**
   * Add styling from static branding. TODO: Should this be moved to an initializer or something?
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async afterModel(_model: any, _transition: any) {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
}
