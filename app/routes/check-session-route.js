import { inject as service } from '@ember/service';
import $ from 'jquery';
import Route from '@ember/routing/route';
import ENV from '../config/environment';

export default class CheckSessionRouteRoute extends Route {
  @service('toast')
  toast;

  @service('error-handler')
  errorHandler;

  beforeModel(transition) {
    let url = 'Make sure you set your ENV.userService.url value in ~config/environment.js or your .env file';
    if (ENV.userService.url) {
      url = ENV.userService.url;
    }
    $.get(url, (data) => {
      if (!(data.username)) {
        transition.abort();
        this.errorHandler.handleError(new Error('shib302'));
      }
    });
  }
}
