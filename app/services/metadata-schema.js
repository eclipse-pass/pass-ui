import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  ajax: Ember.inject.service('ajax'),
  schemaService: ENV.schemaService,

  /**
   * TODO don't know the actual API yet!
   * @param {} repositories
   */
  getMetadataSchemas(repositories) {
    const url = this.get('url');
    return this.get('ajax').request(url, 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8'
      },
      data: {
        repositories
      }
    });
  }
});
