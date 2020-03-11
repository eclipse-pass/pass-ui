import $ from 'jquery';
import Route from '@ember/routing/route';
import ENV from '../config/environment';
import { inject as service } from '@ember/service';

export default Route.extend({
  toast: service('toast'),
  errorHandler: service('error-handler'),
  beforeModel(transition) {
    let url = 'Make sure you set your ENV.userService.url value in ~config/environment.js or your .env file';
    if (ENV.userService.url) {
      url = ENV.userService.url;
    }
    $.get(url, (data) => {
      if (!(data.username)) {
        transition.abort();
        this.get('errorHandler').handleError(new Error('shib302'));
      }
    });
  }
});
