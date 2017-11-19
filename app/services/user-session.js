import Service from '@ember/service';

// Fake service to authenticate a user

// TODO Switch to user object.
export default Service.extend({
  user: null,
  authenticated: false,

  login(user) {
    this.set('user', user);
    this.set('authenticated', true)
    // TODO: Return a promise for success/failure?
  },

  logout() {
    this.set('user', null);
    this.set('authenticated', false)
  }
});
