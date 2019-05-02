import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  workflow: service('workflow'),
  beforeModel() {
    this.get('workflow').resetWorkflow();
    this.replaceWith('submissions.new.basics');
  }
});
