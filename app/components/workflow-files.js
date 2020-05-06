import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { A } from '@ember/array';

export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  submissionHandler: service('submission-handler'),
  currentUser: service('current-user'),

  hasManuscript: computed('manuscript', function () {
    return !!get(this, 'manuscript');
  }),

  manuscript: computed('newFiles.[]', 'previouslyUploadedFiles', function () {
    const newFiles = get(this, 'newFiles') || A([]);
    const prevFiles = get(this, 'previouslyUploadedFiles') || A([]);

    return [
      ...prevFiles.toArray(),
      ...newFiles.toArray()
    ].find(file => file.fileRole === 'manuscript');
  }),

  /**
   * Any non-manuscript files
   */
  supplementalFiles: computed('newFiles.[]', 'previouslyUploadedFiles', function () {
    const newFiles = get(this, 'newFiles') || A([]);
    const prevFiles = get(this, 'previouslyUploadedFiles') || A([]);

    return [
      ...prevFiles.toArray(),
      ...newFiles.toArray()
    ].filter(file => file.fileRole !== 'manuscript');
  }),

  _getFilesElement() {
    return document.getElementById('file-multiple-input');
  },

  actions: {
    deleteExistingFile(file) {
      swal({
        title: 'Are you sure?',
        text: 'If you delete this file, it will be gone forever.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'I Agree',
        cancelButtonText: 'Never mind'
      }).then((result) => {
        if (result.value) {
          const mFiles = this.get('previouslyUploadedFiles');
          // Remove the file from the model
          if (mFiles) {
            mFiles.removeObject(file);
          }

          const newFiles = get(this, 'newFiles');
          if (newFiles) {
            newFiles.removeObject(file);
          }

          this.get('submissionHandler').deleteFile(file);
        }
      });
    },
    getFiles() {
      const uploads = this._getFilesElement();

      if ('files' in uploads) {
        if (uploads.files.length !== 0) {
          for (let i = 0; i < uploads.files.length; i++) {
            const file = uploads.files[i];
            if (file) {
              if (file.size > (1024 * 1024 * 100)) {
                toastr.error(`Your file '${file.name}' is ${Number.parseFloat(file.size / 1024 / 1024).toPrecision(3)}MB. This exceeds the maximum upload size of 100MB and the file was not added to the submission.`);
                continue; // eslint-disable-line
              }
              const newFile = this.get('store').createRecord('file', {
                name: file.name,
                mimeType: file.type.substring(file.type.indexOf('/') + 1),
                description: file.description,
                fileRole: 'supplemental',
                _file: file
              });
              if (!get(this, 'hasManuscript')) {
                newFile.set('fileRole', 'manuscript');
              }
              this.get('newFiles').pushObject(newFile);

              // Immediately upload file
              this.get('submissionHandler').uploadFile(this.get('submission'), newFile);
            }
          }
        }
      }
    },
    handleExternalMs(file) {
      const newFiles = this.get('newFiles');

      file.set('submission', this.get('submission'));
      if (!get(this, 'hasManuscript')) {
        file.set('fileRole', 'manuscript');
      } else {
        file.set('fileRole', 'supplemental');
      }

      newFiles.pushObject(file);
      file.save();
    },
    cancel() {
      this.sendAction('abort');
    }
  },
});
