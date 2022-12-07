/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class NoticeBanner extends Component {
  @service router;

  contactUrl = `${window.location.origin}/contact.html`;

  @computed('router.currentRouteName')
  get displayInfoBanner() {
    return true;
  }
}
