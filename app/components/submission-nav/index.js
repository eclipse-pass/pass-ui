import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'pass-ui/config/environment';

export default class SubmissionNav extends Component {
  @service workflow;

  @tracked step = this.workflow.getCurrentStep();
  @tracked maxStep = this.workflow.getMaxStep();

  constructor() {
    super(...arguments);

    if (ENV.environment === 'test') {
      this.covidSelectionBanner = true;
    }
  }

  @action
  scrollTo() {
    window.scrollTo(0, 0);
  }
}
