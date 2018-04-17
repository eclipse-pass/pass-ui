import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import ENV from '../config/environment';

export default Base.extend({
  restore(data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },
  authenticate(username, password) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: `${ENV.host}/api-auth-token/`,
        type: 'POST',
        data: JSON.stringify({
          username,
          password,
        }),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
      }).then((response) => {
        Ember.run(() => {
          resolve({
            token: response.token,
          });
        });
      }, (xhr, status, error) => {
        const response = xhr.responseText;
        Ember.run(() => {
          reject(response);
        });
      });
    });
  },
});
