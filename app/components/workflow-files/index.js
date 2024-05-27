/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ENV from 'pass-ui/config/environment';
import { tracked } from '@glimmer/tracking';

export default class WorkflowFiles extends Component {
  @service store;
  @service workflow;
  @service submissionHandler;
  @service currentUser;
  @service flashMessages;

  get hasManuscript() {
    return !!this.manuscript;
  }

  get manuscript() {
    const newFiles = this.args.newFiles || [];
    const prevFiles = this.args.previouslyUploadedFiles || [];

    return [...prevFiles.slice(), ...newFiles.slice()].find((file) => file.fileRole === 'manuscript');
  }

  /**
   * Any non-manuscript files
   */
  get supplementalFiles() {
    const newFiles = this.args.newFiles || [];
    const prevFiles = this.args.previouslyUploadedFiles || [];

    return [...prevFiles.slice(), ...newFiles.slice()].filter((file) => file.fileRole !== 'manuscript');
  }

  @task
  handleExternalMs = function* (file) {
    file.submission = this.args.submission;
    if (!this.hasManuscript) {
      file.fileRole = 'manuscript';
    } else {
      file.fileRole = 'supplemental';
    }

    this.args.updateNewFiles(file);
    yield file.save();
  };

  @action
  deleteExistingFile(file) {
    swal({
      title: 'Are you sure?',
      text: 'If you delete this file, it will be gone forever.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'I Agree',
      cancelButtonText: 'Never mind',
    }).then(async (result) => {
      if (result.value) {
        const deleted = await this.deleteFile(file);

        if (deleted) {
          const mFiles = this.args.previouslyUploadedFiles;
          // Remove the file from the model
          if (mFiles) {
            this.args.updatePreviouslyUploadedFiles(mFiles.filter((f) => f.id !== file.id));
          }

          const newFiles = this.args.newFiles;
          if (newFiles) {
            this.args.updateNewFiles(newFiles.filter((f) => f.id !== file.id));
          }
          document.querySelector('#file-multiple-input').value = null;
        }
      }
    });
  }

  @action
  updateFileDescription(file, event) {
    file.description = event.target.value;
  }

  @action
  updateFileRole(file, event) {
    file.fileRole = event.target.value;
  }

  @action
  async uploadFile(FileUpload) {
    try {
      const response = await FileUpload.upload(ENV.fileServicePath);

      const file = await response.json();

      const newFile = await this.store.createRecord('file', {
        name: file.fileName,
        mimeType: file.mimeType,
        description: '',
        fileRole: 'supplemental',
        uri: `/file/${file.uuid}/${encodeURIComponent(file.fileName)}`,
        submission: this.args.submission,
      });
      if (!this.hasManuscript) {
        newFile.fileRole = 'manuscript';
      }
      const savedFile = await newFile.save();

      this.args.updateNewFiles([savedFile, ...this.args.newFiles]);
      this.args.updateAllFiles([savedFile, ...this.args.newFiles, ...this.args.previouslyUploadedFiles]);
    } catch (error) {
      FileUpload.file.state = 'aborted';
      console.error(error);
    }

    return true;
  }

  @action
  async deleteFile(file) {
    let files = [...this.args.previouslyUploadedFiles, ...this.args.newFiles];
    if (!file) {
      return;
    }

    // Delete record without a chance to roll back
    // This will automatically remove the uploaded bytes of the original file
    // then delete the File model record
    return await file
      .destroyRecord()
      .then(() => {
        const filteredFiles = files.filter((f) => f.id !== file.id);

        this.args.updateAllFiles(filteredFiles);

        return true;
      })
      .catch((error) => {
        console.error('[Workflow Files] Failed to delete file');
        console.error(error);
        this.flashMessages.danger('We encountered an error when removing this file');
        return false;
      });
  }

  @action
  cancel() {
    this.args.abort();
  }
}
