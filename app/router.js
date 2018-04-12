import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', {path: '/welcome'})
  this.route('dashboard', {path: '/'});
  this.route('about');
  this.route('contact');
  this.route('grants', function() {
    this.route('show', { path: '/:grant_id' });
  });
  this.route('login');
});

export default Router;
