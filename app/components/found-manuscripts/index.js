import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { action, get, set } from '@ember/object';

export default class FoundManuscriptsComponent extends Component {
  @service oaManuscriptService;
  @service workflow;
  @service store;
  @service appStaticConfig;

  @tracked foundManuscripts = [];
  @tracked manuscriptsWithErrors = [];
  @tracked selectedManuscript = null;
  @tracked contactUrl;

  constructor() {
    super(...arguments);

    this.getAppConfig.perform();
    this.setupManuscripts.perform();
  }

  get foundManuscriptsToDisplay() {
    let prevFiles = this.args.previouslyUploadedFiles || [];
    let newFiles = this.args.newFiles || [];

    const allFileNames = [...newFiles.slice(), ...prevFiles.slice()].map((file) => file.name);

    return this.foundManuscripts
      .filter((manuscript) => !allFileNames.includes(manuscript.name))
      .filter((manuscript) => {
        return !!manuscript.name && !!manuscript.url;
      });
  }

  @task
  getAppConfig = function* () {
    this.contactUrl = yield this.appStaticConfig.config?.branding?.pages?.contactUrl;
  };

  @task
  setupManuscripts = function* () {
    const doi = this.workflow.getDoiInfo().DOI;
    const foundOAMss = yield this.oaManuscriptService.lookup(doi);

    if (foundOAMss) {
      this.foundManuscripts.push(foundOAMss);
    }
  };
}
