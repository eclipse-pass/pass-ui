import { inject as service } from '@ember/service';
import CheckSessionRoute from './../../check-session-route';

export default class IndexRoute extends CheckSessionRoute {
  @service workflow;
  @service router;

  beforeModel() {
    this.workflow.resetWorkflow();
    this.router.replaceWith('submissions.new.basics');
  }
}
