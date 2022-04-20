import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default class AppStaticConfigService extends Service {
  /**
   * Get the static configuration for PASS -- from ENV vars
   *
   * Note: returning a Promise to ease refactoring effort
   * TODO: don't use a Promise, will effect a lot of controllers and components
   *
   * @returns {Promise}
   */
  getStaticConfig() {
    // return Promise.resolve(ENV.APP.staticConfig);
    return Promise.resolve(PassEmber);
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
