import EmberRouter from '@ember/routing/router';
import config from './config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
  brand = config.brand;
}

Router.map(function () {
  this.route('dashboard', { path: '/' });
  this.route('submissions', function () {
    this.route('detail', { path: '/*path' });
    this.route('detail', { path: '/:submission_id' });
    this.route('new', function () {
      this.route('grants');
      this.route('policies');
      this.route('repositories');
      this.route('metadata');
      this.route('files');
      this.route('review');
      this.route('basics');
    });
  });
  this.route('grants', function () {
    this.route('detail', { path: '/*path' });
    this.route('detail', { path: '/:grant_id' });
  });
  this.route('not-found-error', { path: '/*path' });
  this.route('thanks');
  this.route('auth-callback');
  this.route('authenticated');
});

export default Router;
