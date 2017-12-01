import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { equal, notEmpty } from '@ember/object/computed';
import RSVP from 'rsvp';

// Fake service to authenticate a user that checks users in store

// TODO Switch to user object.
export default Service.extend({
  user: null,
  authenticated: notEmpty('user', null).readOnly(),
  isAdmin: equal('user.role', 'admin').readOnly(),
  isPI: equal('user.role', 'pi').readOnly(),

  store: service(),

  // Attempt to login with username.
  // Return a Promise which will resolve to the specified user on success
  // and undefined if the user does not exist.
  login(username) {
    this.set('user', null);

    // Ensure that empty username matches nothing
    if (!username || username.trim().length == 0) {
      return new RSVP.Promise(resolve => {
        resolve(undefined);
      });
    }

    return this.get('store').query('user', {username: username}).then(results => {
      let user = results.get('firstObject');

      if (user != undefined) {
        this.set('user', user);
      }

      return user;
    });
  },

  logout() {
    this.set('user', null);
  }
});
