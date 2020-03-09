import Service, { inject as service } from '@ember/service';
// import { defer } from 'rsvp';

/**
 * This service can be referenced by components that rely on Elasticsearch query results
 * to populate their models. In some cases, ES results may contain old (incorrect) data
 * because of the lag time between changes in Fedora and reindexing in ES. If such a
 * situation is known in advance, a component can refer to this service to know about
 * any object IDs that have changed that may not appear in the ES results.
 *
 * An ignore list is maintained here. Components can declare that certain model IDs
 * should be ignored through a transition, then other components can check against this
 * list after the transtition.
 *
 * #waitForES : polls ES a few times and looks for a known change to appear in the ES
 *              result. This was a less desirable option due to it's performance and
 *              networking hit.
 */
export default Service.extend({
  store: service('store'),
  /** List of object IDs to ignore */
  ignoreList: [],

  init() {
    this._super(...arguments);
    this.clearIgnore();
  },

  /**
   * Clear the ignore list.
   */
  clearIgnore() {
    this.set('ignoreList', []);
  },

  /**
   * Add an ID to the ignore list
   *
   * @param {string} id model object ID
   */
  ignore(id) {
    if (typeof id !== 'string') {
      console.log('%cYou can only add ID strings to the ignore list', 'color: red;');
      return;
    }
    this.get('ignoreList').push(id);
  },

  unignore(id) {
    if (typeof id !== 'string') {
      console.log('%cYou can only remove ID \'strings\' to the ignore list', 'color: red;');
      return;
    }

    const list = this.get('ignoreList');
    if (list.includes(id)) {
      this.get('ignoreList').splice(list.indexOf(id), 1);
    }
  },

  getIgnoreList() {
    return this.get('ignoreList');
  },

  shouldIgnore(id) {
    return this.get('ignoreList').includes(id);
  },

  /**
   * Wait for Elasticsearch to be reindexed with the given value.
   * If no property is provided, assume that the object was deleted.
   *
   * @param {string} id object ID
   * @param {string} type model type
   * @param {object} change { key: value } the updated property key/value
   * @returns {Promise} resolves when the known change is observed in the ES results
   *                    rejects if max number of retries is reached
   */
  // waitForES(id, type, change) {
  //   const promise = defer();
  //   let count = 0;

  //   const store = this.get('store');

  //   const timer = window.setInterval(() => {
  //     store.query(type, { term: { '@id': id } }).then((objs) => {
  //       const changeFound = (obj) => {
  //         for (let key in change) {
  //           if (obj.get(key) !== change[key]) {
  //             return false;
  //           }
  //         }
  //         return true;
  //       };

  //       if (objs.any(obj => changeFound(obj))) {
  //         window.clearInterval(timer);
  //         promise.resolve();
  //       }

  //       if (count++ >= 10) {
  //         window.clearInterval(timer);
  //         promise.reject('Max retries reached');
  //       }
  //     });
  //   }, 500);

  //   return promise.promise;
  // }

});
