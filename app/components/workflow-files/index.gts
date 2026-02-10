import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import ENV from 'pass-ui/config/environment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import swal from 'sweetalert2/dist/sweetalert2.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fileQueue from 'ember-file-upload/helpers/file-queue';
import FoundManuscripts from 'pass-ui/components/found-manuscripts';

const eq = (a: unknown, b: unknown) => a === b;

export default class WorkflowFiles extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare submissionHandler: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare currentUser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;

  @tracked doi: string | null = null;

  constructor(...args: any[]) {
    super(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.doi = (this.args as any).doi;
  }

  get hasFiles(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (
      this.workflow.getFiles().filter((file: any) => file.submission.id === (this.args as any).submission.id).length > 0
    );
  }

  get hasManuscript(): boolean {
    return !!this.manuscript;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get manuscript(): any {
    return (
      this.workflow
        .getFiles()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((file: any) => file.submission.id === (this.args as any).submission.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .find((file: any) => file.fileRole === 'manuscript')
    );
  }

  get supplementalFiles() {
    return (
      this.workflow
        .getFiles()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((file: any) => file.submission.id === (this.args as any).submission.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((file: any) => file.fileRole !== 'manuscript')
    );
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteExistingFile(file: any) {
    swal
      .fire({
        target: ENV.APP.rootElement,
        title: 'Are you sure?',
        text: 'If you delete this file, it will be gone forever.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'I Agree',
        cancelButtonText: 'Never mind',
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(async (result: any) => {
        if (result.value) {
          const deleted = await this.deleteFile(file);
          if (deleted) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (document.querySelector('#file-multiple-input') as any).value = null;
          }
        }
      });
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFileDescription(file: any, event: Event) {
    file.description = (event.target as HTMLInputElement).value;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFileRole(file: any, event: Event) {
    file.fileRole = (event.target as HTMLSelectElement).value;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async uploadFile(FileUpload: any) {
    try {
      const response = await FileUpload.upload(ENV.fileServicePath, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)!['1'],
        },
      });

      const file = await response.json();

      const newFile = await this.store.createRecord('file', {
        name: file.fileName,
        mimeType: file.mimeType,
        description: '',
        fileRole: 'supplemental',
        uri: `/file/${file.uuid}/${encodeURIComponent(file.fileName)}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submission: (this.args as any).submission,
      });
      if (!this.hasManuscript) {
        newFile.fileRole = 'manuscript';
      }
      const savedFile = await newFile.save();
      this.workflow.addFile(savedFile);
    } catch (error) {
      FileUpload.file.state = 'aborted';
      console.error(error);
    }

    return true;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteFile(file: any) {
    if (!file) {
      return;
    }

    const deletedFileId = file.id;
    return await file
      .destroyRecord()
      .then(() => {
        this.workflow.removeFile(deletedFileId);
        return true;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error('[Workflow Files] Failed to delete file');
        console.error(error);
        this.flashMessages.danger('We encountered an error when removing this file');
        return false;
      });
  }

  @action
  cancel() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).abort();
  }

  <template>
    {{! template-lint-disable link-rel-noopener require-button-type require-input-label }}
    {{#each @submission.repositories as |repo|}}
      {{#if (eq repo.repositoryKey 'pmc')}}
        <p class='lead text-muted'>
          <a href='https://www.ncbi.nlm.nih.gov/pmc/about/public-access/' target='_blank'>
            National Institutes of Health (NIH) and other PubMed Central-supported funding agencies
          </a>
          require funded authors to submit the Author's Accepted Manuscripts. For clarification on the difference
          between Author's Accepted Manuscript and Final Published Article,
          <a href='https://www.ncbi.nlm.nih.gov/pmc/about/authorms/' target='_blank'>
            please see here
          </a>
          .
        </p>
        <p class='lead text-muted'>
          To ensure successful processing of your submission in NIH Manuscript Submission System, be sure to include all
          referenced tables, figures and supplemental files in your submission, in addition to the Author's Accepted
          Manuscript.
        </p>
      {{/if}}
    {{/each}}
    {{#if this.hasFiles}}
      <div class='row'>
        <div class='col-lg-12'>
          <table class='table table-responsive-sm table-sm'>
            <thead>
              <tr class='text-center'>
                <th>
                  File Name
                </th>
                <th>
                  File Role
                </th>
                <th>
                  <span
                    tooltip-position='top'
                    tooltip='Brief descriptive label, may be displayed in some repositories.'
                  >
                    <i class='fas fa-info-circle d-inline'></i>
                    Description
                  </span>
                </th>
                <th>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {{#if this.manuscript}}
                <tr data-test-added-manuscript-row>
                  <td class='vertical-align-middle'>
                    {{#if this.manuscript.uri}}
                      <a href={{this.manuscript.uri}}>
                        {{this.manuscript.name}}
                      </a>
                    {{else}}
                      {{this.manuscript.name}}
                    {{/if}}
                  </td>
                  <td class='text-center vertical-align-middle'>
                    Manuscript
                  </td>
                  <td class='vertical-align-middle'>
                    <input
                      aria-label='Manuscript description input'
                      class='form-control file-description-width'
                      value={{this.manuscript.description}}
                      {{on 'change' (fn this.updateFileDescription this.manuscript)}}
                    />
                  </td>
                  <td class='text-center vertical-align-middle'>
                    <button
                      type='button'
                      class='btn btn-outline-danger'
                      data-test-remove-file-button
                      {{on 'click' (fn this.deleteExistingFile this.manuscript)}}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              {{/if}}
              {{#each this.supplementalFiles as |file|}}
                <tr data-test-added-supplemental-row>
                  <td class='vertical-align-middle'>
                    {{#if file.uri}}
                      <a href='{{file.uri}}'>
                        {{file.name}}
                      </a>
                    {{else}}
                      {{file.name}}
                    {{/if}}
                  </td>
                  <td class='text-center vertical-align-middle'>
                    <select {{on 'change' (fn this.updateFileRole file)}}>
                      <option value='supplement' selected={{eq file.fileRole 'supplement'}}>
                        Supplement
                      </option>
                      <option value='table' selected={{eq file.fileRole 'table'}}>
                        Table
                      </option>
                      <option value='figure' selected={{eq file.fileRole 'figure'}}>
                        Figure
                      </option>
                    </select>
                  </td>
                  <td class='vertical-align-middle'>
                    <input
                      aria-label='File description input'
                      class='form-control file-description-width'
                      value={{file.description}}
                      {{on 'change' (fn this.updateFileDescription file)}}
                    />
                  </td>
                  <td class='text-center vertical-align-middle'>
                    <button
                      type='button'
                      class='btn btn-outline-danger'
                      data-test-remove-file-button
                      {{on 'click' (fn this.deleteExistingFile file)}}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </div>
    {{/if}}
    <p class='lead'>
      Attach manuscript/article files to this submission by selecting an existing open access (OA) copy we've discovered
      on the web or by uploading files from your computer. Once you've selected the manuscript/article, you will still
      be able to manually add supplemental material to the submission by uploading them from your computer.
    </p>
    <p class='lead'>
      Each individual file must be smaller than 100MB.
    </p>
    <div class='mb-3 row'>
      <div class='col-md-12'>
        <FoundManuscripts @disabled={{this.hasManuscript}} @doi={{this.doi}} />
      </div>
    </div>
    <div class='mb-3 row'>
      <div class='col-md-12'>
        {{#let (fileQueue name='files' onFileAdded=this.uploadFile) as |queue|}}
          <input
            aria-label='File upload input'
            type='file'
            id='file-multiple-input'
            multiple
            size='50'
            class='file-input'
            {{queue.selectFile}}
          />
        {{/let}}
      </div>
    </div>
    <p>
      <strong>
        Tip:
      </strong>
      Use the Control or the Shift key to select multiple files.
    </p>
    <button class='btn btn-outline-primary' type='button' {{on 'click' @back}}>
      Back
    </button>
    <button class='btn btn-outline-danger ml-2' type='button' {{on 'click' this.cancel}}>
      Cancel
    </button>
    <button class='btn btn-primary pull-right next' type='button' data-test-workflow-files-next {{on 'click' @next}}>
      Next
    </button>
  </template>
}
