import Route from '@ember/routing/route';
import ENV from '../config/environment';
export default Route.extend({
  toast: Ember.inject.service('toast'),
  redirect() {
    let url = "Make sure you set your ENV.userService.url value in ~config/environment.js or your .env file";
    if (ENV.userService.url) {
      url = ENV.userService.url;
    }
    Ember.$.get( url, (data) => {
      if (!(data.username)) {
        this.get('errorHandler').handleError(new Error('shib302'));
      }
    });
  }
});
