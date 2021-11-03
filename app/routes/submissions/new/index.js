import { inject as service } from '@ember/service';
// import Route from '../check-session-route';
import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  @service('workflow')
  workflow;

  beforeModel() {
    this.workflow.resetWorkflow();
    this.replaceWith('submissions.new.basics');
  }
}
