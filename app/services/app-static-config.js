import Service from '@ember/service';
import { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';

export default class AppStaticConfigService extends Service {
  @service flashMessages;

  configUrl = null;

  /** Cached static config object */
  _config = null;

  constructor() {
    super(...arguments);
    this.configUrl = ENV.APP.staticConfigUri;
  }

  /**
   * Get the static configuration for PASS -- from ENV vars
   *
   * Note: returning a Promise to ease refactoring effort
   * TODO: don't use a Promise, will effect a lot of controllers and components
   *
   * @returns {Promise}
   */
  async getStaticConfig() {
    // return Promise.resolve(PassEmber);
    const cached = this._config;
    if (cached) {
      return await Promise.resolve(cached);
    }

    try {
      const resp = await fetch(this.configUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await resp.json();
      this._config = data;
      return data;
    } catch (error) {
      console.log(`%cFailed to get static 'config.json'. ${error}`, 'color:red;');
      this.flashMessages.error('Unable to load theme. PASS may look different than expected.');
    }
  }

  /**
   * Load a CSS file from a known URI and add it to the document head
   *
   * @param {string} uri URI of CSS resource
   */
  addCSS(uri) {
    if (window.document.querySelector(`link[rel="${uri}"`)) {
      return;
    }

    const newLink = window.document.createElement('link');
    newLink.setAttribute('rel', 'stylesheet');
    newLink.setAttribute('href', uri);

    window.document.head.appendChild(newLink);
  }

  addFavicon(uri) {
    const fav = document.querySelector('head link[rel="icon"]');
    if (fav || !uri) {
      return;
    }

    const newFav = window.document.createElement('link');
    newFav.setAttribute('rel', 'icon');
    newFav.setAttribute('href', uri);

    window.document.head.appendChild(newFav);
  }
}
