// app/adapters/user.js
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this._super(...arguments)}/me/`;
    }
    return this._super(...arguments);
  },
});
