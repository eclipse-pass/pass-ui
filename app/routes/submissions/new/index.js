import { inject as service } from '@ember/service';
import CheckSessionRoute from './../../check-session-route';

export default class IndexRoute extends CheckSessionRoute {
  @service('workflow')
  workflow;

  beforeModel() {
    this.workflow.resetWorkflow();
    this.replaceWith('submissions.new.basics');
  }
}
