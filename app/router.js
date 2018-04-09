import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login'); // this route must be first, since it's the default.
  this.route('dashboard');
  this.route('about');
  this.route('contact');
  this.route('grants', function() {
    this.route('show', { path: '/:grant_id' });
  });
  this.route('submissions', function() {
    this.route('show', { path: '/:submission_id' });
  });
  this.route('submission', function() {
    this.route('show', { path: '/:submission_id' }, function() {
      this.route('compliance');
      this.route('metadata');
      this.route('attachments');
      this.route('submission');
      this.route('repositories');
      this.route('funding');
    });
    this.route('new');
  })
});

export default Router;
