/* eslint-disable ember/no-get */
import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationRoute extends CheckSessionRoute {
  @service('app-static-config') staticConfig;

  queryParams = ['userToken'];

  /* Used as route-action in templates */
  @action
  back() {
    history.back();
  }

  @action
  transitionTo(route, model) {
    this.transitionTo(route, model);
  }

  /**
   * If there is a userToken query parameter call the user service with that parameter
   * to ensure objects are updated in the backend before any queries are done.
   */
  async beforeModel(transition) {
    let userToken = transition.to.queryParams.userToken;

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
  async afterModel(model, transition) {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
}
