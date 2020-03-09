import { A } from '@ember/array';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  configUrl: null,
  /** List of URI strings, used to tell which static assets have already been loaded */
  _loaded: A(),

  /** Cached static config object */
  _config: null,

  init() {
    this._super(...arguments);
    this.set('configUrl', ENV.APP.staticConfigUri);
  },

  /**
   * Get the static configuration for PASS
   *
   * @returns {Promise}
   */
  getStaticConfig() {
    const cached = this.get('_config');
    if (cached) {
      return Promise.resolve(cached);
    }

    return fetch(this.get('configUrl'), {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(resp => resp.json())
      .then((data) => {
        this.set('_config', data);
        return data;
      })
      .catch((error) => {
        console.log(`%cFailed to get static 'config.json'. ${error}`, 'color:red;');
        toastr.error(
          'Unable to load theme. PASS may look different than expected.',
          null,
          {
            timeOut: 0,
            extendedTimeOut: 0,
            preventDuplicates: true
          }
        );
      });
  },

  /**
   * Load a CSS file from a known URI and add it to the document head
   *
   * @param {string} uri URI of CSS resource
   */
  addCSS(uri) {
    if (this._alreadyLoaded(uri)) {
      return;
    }
    const newLink = window.document.createElement('link');
    newLink.setAttribute('rel', 'stylesheet');
    newLink.setAttribute('href', uri);

    window.document.head.appendChild(newLink);

    this.get('_loaded').pushObject(uri);
  },

  addFavicon(uri) {
    const fav = document.querySelector('head link[rel="icon"]');
    if (fav || !uri) {
      return;
    }

    const newFav = window.document.createElement('link');
    newFav.setAttribute('rel', 'icon');
    newFav.setAttribute('href', uri);

    window.document.head.appendChild(newFav);
  },

  _alreadyLoaded(uri) {
    return this.get('_loaded').includes(uri);
  }

});
