/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import swal from 'sweetalert2';
import { task } from 'ember-concurrency-decorators';
import ENV from 'pass-ui/config/environment';

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

  @tracked doiInfo = this.workflow.doiInfo;
  @tracked readOnlyProperties = [];
  @tracked metadata = {};
  @tracked schema = null;
  @tracked missingRequiredJournal = false;

  constructor() {
    super(...arguments);

    let md;
    try {
      md = JSON.parse(this.args.submission.metadata);
    } catch (e) {
      // console.log(e);
      // Do nothing
    } finally {
      this.metadata = md || {};
      this.setReadOnly({});

      console.log('parsed submission metadata');
      console.log(this.metadata);
    }
  }

  @task
  setupSchema = function* () {
    // DOIs for testing: 10.1002/0470841559.ch1, 10.4137/CMC.S38446, 10.1039/c7an01256j
    if (!this.schema) {
      const repositories = yield this.args.submission.repositories;
      const schema = this.metadataSchema.getMetadataSchema(repositories);

      // TODO Fix this. Add something to schema service to figure this out
      // const requiresJournal =
      //     schemas.findIndex((schema) => 'required' in schema && schema.required.includes('journal-title')) != -1;
      // const doiInfo = this.doiInfo;
      // const journal = yield this.args.publication.journal;

      // this.missingRequiredJournal = requiresJournal && !journal;

      // Add relevant fields from DOI data to submission metadata
      // FIXME THis is already done in basic step right?
      //const metadataFromDoi = this.doi.doiToMetadata(doiInfo, journal, this.metadataSchema.getFields(schemas));

      //if (this.workflow.isDataFromCrossref()) {
      // this.setReadOnly(doiInfo);
      //}

      // this.updateMetadata(metadataFromDoi);

      this.schema = schema;

      console.log('loaded and set schema');

      const readonly = this.readOnlyProperties;
      // Handle readonly when schema fetched?
      // service.addDisplayData(processed, metadata, readonly);
    }
  };

  // TODO This seems wrong
  /**
   * Set the object keys as read-only metadata fields. This assumes that incoming metadata captured
   * before this component is reached is read-only such as Crossref metadata or title/journal
   * from the first step of the workflow
   *
   * @param {object} metadata
   */
  setReadOnly(metadata) {
    this.readOnlyProperties = Object.keys(metadata);
  }

  @action
  cancel() {
    this.args.abort();
  }

  @action
  next(newMetadata) {
    console.log('clicked next');

    const submission = this.args.submission;

    newMetadata.agent_information = this.getBrowserInfo();

    console.log('set metadata');
    console.log(newMetadata);

    submission.metadata = JSON.stringify(newMetadata);

    this.args.next();
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
