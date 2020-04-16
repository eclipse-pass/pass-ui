import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SubmissionNav extends Component {
  @service workflow;

  @tracked currentStep = this.workflow.getCurrentStep();
  @tracked maxStep = this.workflow.getMaxStep();

  @action
  loadTab(gotoRoute) {
    this.loadTab(gotoRoute);
  }

  @action
  scrollTo() {
    window.scrollTo(0, 0);
  }
}
