/* eslint-disable ember/no-get */
/* eslint-disable no-debugger */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

/**
 * Some links in the navbar point to static pages hosted outside of Ember.
 */

export default class NavBar extends Component {
  @service currentUser;
  @service appStaticConfig;
  @service session;

  @tracked aboutUrl = null;
  @tracked contactUrl = null;
  @tracked faqUrl = null;
  @tracked isUserMenuOpen = false;

  constructor() {
    super(...arguments);

    this._setupAppStaticConfig.perform();
  }

  /**
   * Do we have a valid user loaded into the user service?
   */
  get hasAUser() {
    return !!get(this, 'currentUser.user');
  }

  @action
  scrollToAnchor() {
    if (window.location.search.indexOf('anchor=') == -1) {
      window.scrollTo(0, 0);
    }
  }

  @action
  async logOut() {
    const url = `${window.location.origin}/logout`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)['1'],
      },
    });
    await this.session.invalidate();
  }

  @task
  _setupAppStaticConfig = function* () {
    let config = yield this.appStaticConfig.config;
    if (config && config.branding.showPagesNavBar) {
      this.aboutUrl = config.branding.pages.aboutUrl;
      this.contactUrl = config.branding.pages.contactUrl;
      this.faqUrl = config.branding.pages.faqUrl;
    }
  };

  @action
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
}
