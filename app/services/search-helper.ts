import Service, { service } from '@ember/service';
import type AppStore from 'pass-ui/services/store';

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

export default class SearchHelperService extends Service {
  @service declare store: AppStore;

  /** List of object IDs to ignore */
  ignoreList: string[] = [];

  constructor() {
    super();
    this.clearIgnore();
  }

  /**
   * Clear the ignore list.
   */
  clearIgnore(): void {
    this.ignoreList = [];
  }

  /**
   * Add an ID to the ignore list
   *
   * @param {string} id model object ID
   */
  ignore(id: string): void {
    if (typeof id !== 'string') {
      console.log('%cYou can only add ID strings to the ignore list', 'color: red;');
      return;
    }
    this.ignoreList.push(id);
  }

  unignore(id: string): void {
    if (typeof id !== 'string') {
      console.log("%cYou can only remove ID 'strings' to the ignore list", 'color: red;');
      return;
    }

    const list = this.ignoreList;
    if (list.includes(id)) {
      this.ignoreList.splice(list.indexOf(id), 1);
    }
  }

  getIgnoreList(): string[] {
    return this.ignoreList;
  }

  shouldIgnore(id: string): boolean {
    return this.ignoreList.includes(id);
  }
}
