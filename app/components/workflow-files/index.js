/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Component from '@glimmer/component';
import { action, get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';

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

  _getFilesElement() {
    return document.getElementById('file-multiple-input');
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

        this.submissionHandler.deleteFile(file);

        document.querySelector('#file-multiple-input').value = null;
      }
    });
  }

  @action
  async uploadFile(FileUpload) {
    try {
      const response = await FileUpload.upload('/file');

      // const thing = {
      //   id: '7a000934-6f21-49b7-9ca3-cbef6bc966e9/Nanometer-Scale Thermometry.pdf',
      //   uuid: '7a000934-6f21-49b7-9ca3-cbef6bc966e9',
      //   fileName: 'Nanometer-Scale Thermometry.pdf',
      //   mimeType: 'application/pdf',
      //   storageType: 'FILE_SYSTEM',
      //   size: 1031677,
      //   extension: 'pdf',
      // };

      const newFile = await this.store.createRecord('file', {
        name: FileUpload.file.name,
        mimeType: FileUpload.file.type.substring(file.type.indexOf('/') + 1),
        description: FileUpload.file.description,
        fileRole: 'supplemental',
        _file: FileUpload.file,
      });
      if (!this.hasManuscript) {
        newFile.fileRole = 'manuscript';
      }
      this.args.newFiles.pushObject(newFile);
    } catch (error) {
      FileUpload.file.state = 'aborted';
    }

    return true;
  }

  @action
  removeFile(file) {
    let files = this.args.newFiles;
    files.removeObject(file);
    set(this, 'files', files);

    this.submissionHandler.deleteFile(file);
  }

  @action
  cancel() {
    this.abort();
  }
}
