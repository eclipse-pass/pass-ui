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
    }).then((result) => {
      if (result.value) {
        const mFiles = get(this, 'args.previouslyUploadedFiles');
        // Remove the file from the model
        if (mFiles) {
          mFiles.removeObject(file);
        }

        const newFiles = get(this, 'args.newFiles');
        if (newFiles) {
          newFiles.removeObject(file);
        }

        this.deleteFile(file);

        document.querySelector('#file-multiple-input').value = null;
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
      await newFile.save();
      this.args.newFiles.pushObject(newFile);
    } catch (error) {
      FileUpload.file.state = 'aborted';
    }

    return true;
  }

  @action
  async deleteFile(file) {
    let files = [...this.args.previouslyUploadedFiles, ...this.args.newFiles];
    files.removeObject(file);

    if (!file) {
      return;
    }

    file.set('submission', undefined);
    await file.save();
    file.unloadRecord();
  }

  @action
  cancel() {
    this.args.abort();
  }
}
