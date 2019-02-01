import Route from '@ember/routing/route';

const {
  service,
} = Ember.inject;

export default Route.extend({
  workflow: service(),
  beforeModel() {
    this.get('workflow').resetWorkflow();
    this.replaceWith('submissions.new.basics');
  }
});
