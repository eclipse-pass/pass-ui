import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class FoundManuscriptsComponent extends Component {
  @service oaManuscriptService;
  @service workflow;
  @service store;
  @service appStaticConfig;

  @tracked foundManuscripts = A([]);
  @tracked assetsUri;

  constructor() {
    super(...arguments);

    this.getAppConfig.perform();
    this.setupManuscripts.perform();
  }

  get foundManuscriptsToDisplay() {
    let prevFiles = this.args.previouslyUploadedFiles || A([]);
    let newFiles = this.args.newFiles || A([]);

    const allFileNames = [
      ...newFiles.toArray(),
      ...prevFiles.toArray()
    ].map(file => file.name);

    return this.foundManuscripts.filter(foundMs => !allFileNames.includes(foundMs.name));
  }

  @task
  * getAppConfig() {
    let config = yield this.appStaticConfig.getStaticConfig();
    this.assetsUri = config.assetsUri;
  }

  @task
  * setupManuscripts() {
    const doi = this.workflow.getDoiInfo().DOI;
    const foundOAMss = yield this.oaManuscriptService.lookup(doi);

    if (foundOAMss) {
      this.foundManuscripts.pushObjects(foundOAMss);
    }
  }

  /**
   * @param {object} selectedManuscript {
   *   url: '', // URL where the manuscript can be retrieved
   *   name: '', // File name
   *   type: '', // MIME-type of the file
   *   source: '', // Where we found this manuscript (e.g. "Unpaywall")
   *   repositoryLabel: '' // Human readable name of the repository where the manuscript is stored
   * }
   */
  @task
  * addFile(selectedManuscript) {
    const doi = this.workflow.getDoiInfo().DOI;
    const result = yield this.oaManuscriptService.downloadManuscript(selectedManuscript.url, doi);

    // TODO: handle error conditions

    const file = this._ms2File(selectedManuscript, result);

    this.args.handleExternalMs(file);
  }

  /**
   * Create a new File model object with metadata found in the open access downloader file
   * lookup and add the URL location where the file was downloaded. This model object will
   * not be persisted here, nor will it have a submission attached to it.
   *
   * @param {object} manuscript data from the original #lookup
   * @param {string} bitsUrl Fedora URL where the file bits can be found
   * @returns {File}
   */
  _ms2File(manuscript, bitsUrl) {
    return this.store.createRecord('file', {
      name: manuscript.name,
      uri: bitsUrl,
      mimeType: manuscript.type,
      description: manuscript.description
    });
  }
}
