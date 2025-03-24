/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';

export default class WorkflowFiles extends Component {
  @service store;
  @service workflow;
  @service submissionHandler;
  @service currentUser;
  @service flashMessages;

  get hasFiles() {
    return this.workflow.getFiles().length > 0;
  }

  get hasManuscript() {
    return !!this.manuscript;
  }

  get manuscript() {
    return this.workflow.getFiles().find((file) => file.fileRole === 'manuscript');
  }

  /**
   * Any non-manuscript files
   */
  get supplementalFiles() {
    return this.workflow.getFiles().filter((file) => file.fileRole !== 'manuscript');
  }

  @action
  deleteExistingFile(file) {
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
      .then(async (result) => {
        if (result.value) {
          const deleted = await this.deleteFile(file);
          if (deleted) {
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
      const response = await FileUpload.upload(ENV.fileServicePath, {
        headers: {
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)['1'],
        },
      });

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
      this.workflow.addFile(savedFile);
    } catch (error) {
      FileUpload.file.state = 'aborted';
      console.error(error);
    }

    return true;
  }

  @action
  async deleteFile(file) {
    if (!file) {
      return;
    }

    // Delete record without a chance to roll back
    // This will automatically remove the uploaded bytes of the original file
    // then delete the File model record
    const deletedFileId = file.id;
    return await file
      .destroyRecord()
      .then(() => {
        this.workflow.removeFile(deletedFileId);
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
