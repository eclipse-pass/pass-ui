/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class NoticeBanner extends Component {
  @service router;
  @service appStaticConfig;
  @tracked contactUrl = null;
  @tracked instructionsUrl = null;

  constructor() {
    super(...arguments);
    this._setupAppStaticConfig.perform();
  }

  get displayInfoBanner() {
    return true;
  }

  @task
  _setupAppStaticConfig = function* () {
    let config = yield this.appStaticConfig.getStaticConfig();
    this.contactUrl = config.branding.pages.contactUrl;
    this.instructionsUrl = config.branding.pages.instructionsUrl;
  };
}
