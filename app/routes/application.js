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
  beforeModel(transition) {
    let userToken = transition.to.queryParams.userToken;

    if (userToken) {
      return fetch(`/user/whoami?userToken=${encodeURIComponent(userToken)}`);
    }
  }

  async model() {
    const config = await this.staticConfig.getStaticConfig();

    return {
      staticConfig: config,
    };
  }

  /**
   * Add styling from static branding. TODO: Should this be moved to an initializer or something?
   */
  afterModel(model, transition) {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.display = 'none';
    }

    if (model.staticConfig) {
      if (model.staticConfig.branding.stylesheet) {
        const stylesheet = `${model.staticConfig.branding.stylesheet}`;
        this.staticConfig.addCSS(stylesheet);
      } else {
        console.log('%cNo branding stylesheet was configured', 'color:red');
      }
      if (model.staticConfig.branding.overrides) {
        const overrides = `${model.staticConfig.branding.overrides}`;
        this.staticConfig.addCSS(overrides);
      }
      if (model.staticConfig.branding.favicon) {
        const favicon = `${model.staticConfig.branding.favicon}`;
        this.staticConfig.addFavicon(favicon);
      }
    }
  }
}
