import Component from '@ember/component';

function checkDisabled(files) {
  if (!(files)) {
    return true;
  }
  if (files && files.length === 0) {
    return true;
  }
  return false;
}

export default Component.extend({
  store: Ember.inject.service('store'),
  files: Ember.A(),
  init() {
    this._super(...arguments);
    this.set('files', Ember.A());
    if (this.get('filesTemp') && this.get('filesTemp').length > 0) {
      this.get('filesTemp').forEach((file) => {
        this.get('files').pushObject(this.get('store').createRecord('file', file));
      });
      this.set('nextDisabled', false);
    }
  },
  nextDisabled: true,
  actions: {
    next() {
      let isDisabled = checkDisabled(this.get('files'));
      if (!isDisabled) {
        this.set('filesTemp', this.get('files'));
        this.sendAction('next');
      } else {
        toastr.warning('Attach manuscript/article files to this submission.');
      }
    },
    back() {
      this.sendAction('back');
    },
    getFiles() {
      const submission = this.get('model.newSubmission');
      const uploads = document.getElementById('file-multiple-input');
      if ('files' in uploads) {
        if (uploads.files.length !== 0) {
          for (let i = 0; i < uploads.files.length; i++) {
            const file = uploads.files[i];
            if (file) {
              const newFile = this.get('store').createRecord('file', {
                name: file.name,
                mimeType: file.type.substring(file.type.indexOf('/') + 1),
                description: file.description,
                fileRole: 'supplemental',
                uri: 'http://example.com',
                _file: file
              });
              if (this.get('files').length === 0) {
                newFile.set('fileRole', 'manuscript');
              }
              this.get('files').pushObject(newFile);
              if (this.get('files').length === uploads.files.length) {
                this.set('nextDisabled', checkDisabled(this.get('files')));
              }
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
      this.set('nextDisabled', checkDisabled(this.get('files')));
    }
  },
});
