import WorkflowComponent from './workflow-component';

export default WorkflowComponent.extend({
  store: Ember.inject.service('store'),
  files: Ember.A(),
  init() {
    this._super(...arguments);
    this.set('files', Ember.A());
    if (this.get('filesTemp') && this.get('filesTemp').length > 0) {
      this.get('filesTemp').forEach((file) => {
        this.get('files').pushObject(file);
      });
    }
  },
  actions: {
    next() {
      let manuscriptFiles = [].concat(this.get('files'), this.get('model.files') && this.get('model.files').toArray())
        .filter(file => file && file.get('fileRole') === 'manuscript');

      if (manuscriptFiles.length == 0) {
        toastr.warning('At least one manuscript file is required');
      } else if (manuscriptFiles.length > 1) {
        toastr.warning(`Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}`);
      } else {
        // Update any *existing* files that have had their details modified
        let files = this.get('model.files');
        if (files) {
          files.forEach((file) => {
            if (file.get('hasDirtyAttributes')) {
              // Asynchronously save the updated file metadata.
              file.save();
            }
          });
        }
        this.set('filesTemp', this.get('files'));
        this.sendAction('next');
      }
    },
    back() {
      this.sendAction('back');
    },
    deleteExistingFile(file) {
      swal({
        title: 'Are you sure?',
        text: 'If you delete this file, it will be gone forever.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'I Agree',
        cancelButtonText: 'Nevermind'
      }).then((result) => {
        if (result.value) {
          let mFiles = this.get('model.files');

          // Remove the file from the model
          if (mFiles) {
            mFiles.removeObject(file);
          }

          file.destroyRecord();
        }
      });
    },
    getFiles() {
      const submission = this.get('model.newSubmission');
      const uploads = document.getElementById('file-multiple-input');
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
              if (this.get('files').length === 0) {
                newFile.set('fileRole', 'manuscript');
              }
              this.get('files').pushObject(newFile);
            }
          }
        }
      }
    },
    removeFile(file) {
      let files = this.get('files');
      files.removeObject(file);
      this.set('files', files);
      this.set('filesTemp', this.get('files'));
    }
  },
});
