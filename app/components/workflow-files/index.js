/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Component from '@glimmer/component';
import { action, get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';
import ENV from 'pass-ui/config/environment';

export default class WorkflowFiles extends Component {
  @service store;
  @service workflow;
  @service submissionHandler;
  @service currentUser;
  @service flashMessages;

  @computed('manuscript')
  get hasManuscript() {
    return !!get(this, 'manuscript');
  }

  @computed('args.newFiles.[]', 'previouslyUploadedFiles.[]')
  get manuscript() {
    const newFiles = get(this, 'args.newFiles') || A([]);
    const prevFiles = get(this, 'args.previouslyUploadedFiles') || A([]);

    return [...prevFiles.toArray(), ...newFiles.toArray()].find((file) => file.fileRole === 'manuscript');
  }

  /**
   * Any non-manuscript files
   */
  @computed('args.newFiles.[]', 'previouslyUploadedFiles.[]')
  get supplementalFiles() {
    const newFiles = get(this, 'args.newFiles') || A([]);
    const prevFiles = get(this, 'args.previouslyUploadedFiles') || A([]);

    return [...prevFiles.toArray(), ...newFiles.toArray()].filter((file) => file.fileRole !== 'manuscript');
  }

  @task
  handleExternalMs = function* (file) {
    const newFiles = get(this, 'args.newFiles');

    file.set('submission', get(this, 'args.submission'));
    if (!get(this, 'hasManuscript')) {
      file.set('fileRole', 'manuscript');
    } else {
      file.set('fileRole', 'supplemental');
    }

    newFiles.pushObject(file);
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
          const mFiles = get(this, 'args.previouslyUploadedFiles');
          // Remove the file from the model
          if (mFiles) {
            mFiles.removeObject(file);
          }

          const newFiles = get(this, 'args.newFiles');
          if (newFiles) {
            newFiles.removeObject(file);
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
      const response = await FileUpload.upload(ENV.fileServicePath, {
        withCredentials: true,
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
      await newFile.save();
      this.args.newFiles.pushObject(newFile);
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
        files.removeObject(file);
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
