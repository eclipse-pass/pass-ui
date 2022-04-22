import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';
import { action, get, set } from '@ember/object';

export default class FoundManuscriptsComponent extends Component {
  @service oaManuscriptService;
  @service workflow;
  @service store;
  @service appStaticConfig;

  @tracked foundManuscripts = A([]);
  @tracked manuscriptsWithErrors = A([]);
  @tracked selectedManuscript = null;
  @tracked contactUrl;

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
  getAppConfig = function*() {
    let config = yield this.appStaticConfig.getStaticConfig();
    this.contactUrl = config.branding.pages.contactUrl;
  }

  @task
  setupManuscripts = function*() {
    const doi = this.workflow.getDoiInfo().DOI;
    const foundOAMss = yield this.oaManuscriptService.lookup(doi);

    if (foundOAMss) {
      this.foundManuscripts.pushObjects(foundOAMss);
    }
  }
}
