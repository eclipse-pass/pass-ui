import Component from '@ember/component';
import ENV from '../config/environment';
export default Component.extend({
  toast: Ember.inject.service('toast'),
  init() {
    this._super(...arguments);
    let url = "Make sure you set your ENV.userService.url value in ~config/environment.js or your .env file";
    if (ENV.userService.url) {
      url = ENV.userService.url;
    }
    Ember.$.get( url, (data) => {
      if (!(data.username)) {
        this.get('toast').error("Please refresh your page and log back in.", 'Session has been invalidated.');
      }
    });
  }
});
