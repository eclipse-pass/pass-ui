import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CheckSessionRoute from '../../check-session-route';

export default class BasicsRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('workflow') declare workflow: any;

  @action
  didTransition(): void {
    this.workflow.setCurrentStep(1);
  }
}
