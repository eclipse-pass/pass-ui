import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    var grant_id = this.paramsFor('grants.show').grant_id;
    return this.get('store').findRecord('grant', grant_id, { include: 'submissions' });
  }
});
