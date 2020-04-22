
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, get, set, computed } from '@ember/object';

export default class NoticeBanner extends Component {
  @service router;

  @computed('router.currentRouteName')
  get showInfoBanner() {
    return !this.router.currentRouteName.includes('submissions.new');
  }
}
