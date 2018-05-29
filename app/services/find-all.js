import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  ajax: Ember.inject.service(),
  // headers: { 'Content-Type:': 'application/json; charset=utf-8' },
  findAll(type) {
    const data = { from: 0, size: 100 };

    let url = ENV.fedora.elasticsearch;
    if (type) {
      data.type = type;
    }

    return this.get('ajax').request(url, {
      method: 'GET',
      data
    });
  },
});
