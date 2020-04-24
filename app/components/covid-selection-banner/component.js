import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NoticeBanner extends Component {
  @service router;

  @action
  toggleCovidSubmission() {
    this.args.updateCovidSubmission(event.target.checked);
  }
}
