import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

/**
 * The schema service is invoked to retrieve appropriate metadata forms.
 *
 * When a user first enters this step, metadata is pulled from the known DOI blob, if
 * one exists. That metadata is processed to be compliant with known schemas. This becomes
 * the submission metadata blob. Form fields for each metadata schema are prepopulated
 * using the submission metadata. After each form, all of the input fields are grabbed
 * from the metadata forms and used to update the submission metadata, making the values
 * available to autofill subsequent forms.
 */
export default class WorkflowMetadata extends Component {
  @service currentUser;
  @service router; // Used to abort this step
  @service workflow;
  @service metadataSchema;
  @service doi;

  @tracked metadata = {};
  @tracked schema = null;
  @tracked missingRequiredJournal = false;
  @tracked surveyInstance = null;

  constructor() {
    super(...arguments);

    try {
      this.metadata = JSON.parse(this.args.submission.metadata);
    } catch (e) {
      console.log('Error: Submission metadata invalid');
      this.metadata = {};
    }
  }

  @task
  setupSchema = function* () {
    // DOIs for testing: 10.1002/0470841559.ch1, 10.4137/CMC.S38446, 10.1039/c7an01256j
    if (!this.schema) {
      const repositories = yield this.args.submission.repositories;
      this.schema = this.metadataSchema.getMetadataSchema(repositories, this.workflow.getReadOnlyProperties());

      // If journal-title is required, assume a repository requires an existing journal be selected in basics step
      const requiresJournal =
        this.schema.elements.findIndex((el) => el.name === 'journal-title' && 'isRequired' in el && el.isRequired) !=
        -1;
      const journal = yield this.args.publication.journal;
      this.missingRequiredJournal = requiresJournal && !journal;
    }
  };

  @action
  back() {
    this.args.back();
  }

  @action
  cancel() {
    this.args.abort();
  }

  @action
  next(newMetadata) {
    const submission = this.args.submission;

    newMetadata.agent_information = this.getBrowserInfo();
    submission.metadata = JSON.stringify(newMetadata);

    this.args.next();
  }

  @action
  onSurveyReady(survey) {
    this.surveyInstance = survey;
  }

  @action
  handleExternalSubmit() {
    if (this.surveyInstance) {
      this.surveyInstance.doComplete();
    }
  }

  /**
   * Used to set some information in the metadata blob
   */
  getBrowserInfo() {
    let ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE ', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    //  eslint-disable-next-line
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1],
    };
  }
}
