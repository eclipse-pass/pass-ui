/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class NoticeBanner extends Component {
  @service router;

  @computed('router.currentRouteName')
  get displayInfoBanner() {
    return !this.router.currentRouteName.includes('submissions.new');
  }
}
