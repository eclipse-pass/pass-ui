import ApplicationAdapter from './application';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this._super(...arguments)}/me/`;
    }

    return this._super(...arguments);
  },
  host: 'http://localhost:8080',
  // namespace: 'fcrepo/rest',
  authorizer: 'authorizer:drf-token-authorizer',
});
