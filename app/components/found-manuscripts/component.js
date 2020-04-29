import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class FoundManuscriptsComponent extends Component {
  @service manuscripts;
  @service workflow;

  @tracked foundManuscripts = A([]);

  constructor() {
    super(...arguments);

    this.setupManuscripts.perform();
  }

  @task
  * setupManuscripts() {
    let doi = this.workflow.getDoiInfo().DOI;
    let foundUnpaywall = yield this.manuscripts.fetchManuscripts.perform(doi);
    let data = foundUnpaywall.repository_institution || foundUnpaywall.url_for_pdf;

    this.foundManuscripts.pushObject(data);
  }

  @action
  async streamFile(url) {
    let response = await fetch(url, {
      credentials: 'include'
    })
      .then((response) => {
        response.blob();
      }).catch((e) => {
        debugger

      });

    return blob;
  }
}
