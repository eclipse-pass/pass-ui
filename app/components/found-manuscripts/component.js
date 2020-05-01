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

  get foundManuscriptsToDisplay() {
    let prevFiles;

    if (this.args.previouslyUploadedFiles) {
      prevFiles = this.args.previouslyUploadedFiles;
    } else {
      prevFiles = [];
    }
    const allFileNames = [
      ...this.args.newFiles,
      ...prevFiles
    ].map(file => file.name);

    return this.foundManuscripts.filter((url) => {
      const foundName = url.slice(url.lastIndexOf('/') + 1);

      return !allFileNames.includes(foundName);
    });
  }

  @task
  * setupManuscripts() {
    const doi = this.workflow.getDoiInfo().DOI;
    const foundUnpaywall = yield this.manuscripts.fetchManuscripts.perform(doi);
    const data = foundUnpaywall.repository_institution || foundUnpaywall.url_for_pdf;

    if (data) {
      this.foundManuscripts.pushObject(data);
    }
  }

  @action
  async streamFile(remoteFile) {
    if (event.target.checked) {
      // TODO: move this manuscript service url to an ENV var once we discuss more broadly
      const url = `https://shrouded-everglades-05896.herokuapp.com/manuscripts?url=${remoteFile}`;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], url.slice(url.lastIndexOf('/') + 1), { type: 'application/pdf' });
        this.args.uploadFoundManuscripts(file);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
