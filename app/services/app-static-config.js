import Service from '@ember/service';

export default Service.extend({
  configUrl: null,
  /** List of URI strings */
  _loaded: Ember.A(),

  init() {
    this._super(...arguments);
    this.set('configUrl', PassEmber.staticConfigUri);
  },

  /**
   * Get the static configuration for PASS
   */
  getStaticConfig() {
    return fetch(this.get('configUrl'), {
      headers: { 'Content-Type': 'application/json' }
    }).then(resp => resp.json());
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

  _alreadyLoaded(uri) {
    return this.get('_loaded').includes(uri);
  }

});
