import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  // this.route('login');
  this.route('index', { path: '/welcome' });
  this.route('dashboard', { path: '/' });
  this.route('about');
  this.route('contact');
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
  this.route('thanks');
  this.route('404', { path: '/*path' });
  this.route('faq', {
    queryParams: ['anchor']
  });
});

export default Router;
