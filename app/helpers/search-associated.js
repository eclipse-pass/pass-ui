/* eslint-disable ember/no-observers */
import { observes } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import { setProperties } from '@ember/object';
import Helper, { helper } from '@ember/component/helper';

export default class SearchAssociated extends Helper {
  @service('store')
  store;

  type = null;
  propertyName = null;
  associatedId = null;
  content = null;

  /**
   * Search for all objects of a given type that are associated with the given property
   * of a model object.
   *
   * Example:
   *  {{-- In our template context, we have 'model' defined as a Submission --}}
   *  {{search-associated 'deposit' 'submission' submission.id}}
   *
   * The example above will initiate a search using Store.query and return an array
   * of deposits that are associated with the given submission. A way to remember this
   * is to think of how the query will be formed:
   *
   * Search for 'deposit' objects where 'deposit.submission' is the input 'submission.id'
   *
   * @param {} params [arg1, arg2, arg3] =
   * [
   *   object type to retrieve,
   *   property name,
   *   ID to search for
   * ]
   */
  compute(params) {
    // Quit early if we don't have enough info
    if (params.length < 3) {
      return '';
    }

    setProperties(this, {
      type: params[0],
      propertyName: params[1],
      associatedId: params[2],
    });

    return this.content;
  }

  @observes('associatedId')
  paramsChanged() {
    const self = this;
    let query = { size: 500, term: {} };

    query.term[this.propertyName] = this.associatedId;
    this.store.query(this.type, query).then((results) => {
      self.set('content', results);
    });
  }

  @observes('content')
  contentChanged() {
    this.recompute();
  }
}
