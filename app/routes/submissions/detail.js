import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    let sub = this.get('store').findRecord('submission', params.submission_id);
    return sub;
  }
});
