import CheckSessionRoute from './check-session-route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

interface RouteTransition {
  to: {
    queryParams: Record<string, string | undefined>;
  };
}

export default class ApplicationRoute extends CheckSessionRoute {
  @service('app-static-config') declare staticConfig: AppStaticConfigService;
  @service declare router: RouterService;

  // @ts-expect-error legacy queryParams array format
  queryParams = ['userToken'];

  /* Used as route-action in templates */
  @action
  back() {
    history.back();
  }

  @action
  transitionTo(route: string, model: unknown) {
    this.router.transitionTo(route, model);
  }

  /**
   * If there is a userToken query parameter call the user service with that parameter
   * to ensure objects are updated in the backend before any queries are done.
   */
  // @ts-expect-error beforeModel override uses transition parameter
  async beforeModel(transition: RouteTransition) {
    const userToken = transition.to.queryParams.userToken;

    if (!this.staticConfig.config) {
      await this.staticConfig.setupStaticConfig();
    }

    if (userToken) {
      await fetch(`/user/whoami?userToken=${encodeURIComponent(userToken)}`);
    }
  }

  /**
   * Add styling from static branding. TODO: Should this be moved to an initializer or something?
   */
  async afterModel(_model: unknown, _transition: unknown) {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
}
