import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('dashboard');
  this.route('about');
  this.route('contact');
  this.route('grants', function() {
    this.route('show', { path: '/:grant_id' }, function() {
      this.route('submissions');
    });
  });
  this.route('submissions', function() {
    this.route('show', { path: '/:submission_id' });
  });
});

export default Router;
