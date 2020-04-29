import Service from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class ManuscriptsService extends Service {

  @task
  * fetchManuscripts(doi) {
    let unpaywallManuscripts = yield this._fetchUnpaywallManuscripts.perform(doi);

    return unpaywallManuscripts;
  }

  @task
  * _fetchUnpaywallManuscripts(doi) {
    let response = yield fetch(`https://api.unpaywall.org/v2/${doi}?email=moo@moomail.com`);
    let data = yield response.json();

    return data.best_oa_location;
  }
}
