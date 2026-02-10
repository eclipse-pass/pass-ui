import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CheckSessionRoute from '../../check-session-route';
import type Workflow from 'pass-ui/services/workflow';

export default class BasicsRoute extends CheckSessionRoute {
  @service('workflow') declare workflow: Workflow;

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(1);
  }
}
