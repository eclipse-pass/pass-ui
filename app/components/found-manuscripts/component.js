import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';

export default class FoundManuscriptsComponent extends Component {
  @service oaManuscriptService;
  @service workflow;
  @service store;
  @service appStaticConfig;

  @tracked foundManuscripts = A([]);
  @tracked manuscriptsWithErrors = A([]);
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
   *   source: '', // Where we found this manuscript (e.g. 'Unpaywall')
   *   repositoryLabel: '' // Human readable name of the repository where the manuscript is stored
   * }
   */
  @task
  * addFile(selectedManuscript) {
    this.manuscriptsWithErrors.removeObject(selectedManuscript.url);

    const result = yield swal({
      title: 'Please wait while files are loading ...',
      allowOutsideClick: false,
      imageClass: 'lds-dual-ring',
      imageUrl: '',
      showCancelButton: true,
      onBeforeOpen: async () => {
        const confirmButton = Swal.getConfirmButton();
        const cancelButton = Swal.getCancelButton();
        confirmButton.style.display = 'none';
        cancelButton.style.display = 'flex';

        const title = Swal.getTitle();
        const container = document.createElement('div');
        container.classList.add('text-center');
        title.append(container);
        const spinner = document.createElement('div');
        spinner.classList.add('lds-dual-ring');
        spinner.classList.add('mt-2');
        container.appendChild(spinner);

        const doi = this.workflow.getDoiInfo().DOI;
        const result = await this.oaManuscriptService.downloadManuscript(selectedManuscript.url, doi).catch((e) => {
          const title = Swal.getTitle();
          const content = Swal.getContent();
          const confirmButton = Swal.getConfirmButton();

          title.innerHTML = 'File load failed';
          content.innerHTML = e.message;
          confirmButton.style.display = 'flex';
          confirmButton.innerHTML = 'Retry';

          Swal.enableButtons();

          this.manuscriptsWithErrors.pushObject(selectedManuscript.url);

          return 'false';
        });

        if (result !== 'false') {
          const file = this._ms2File(selectedManuscript, result);

          await this.args.handleExternalMs(file);

          Swal.closeModal();
        }
      }
    });

    if (result.value) {
      this.addFile.perform(selectedManuscript);
    }
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
