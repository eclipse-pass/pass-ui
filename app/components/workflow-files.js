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
    if (this.get('filesTemp') && JSON.parse(this.get('filesTemp')).length > 0) {
      JSON.parse(this.get('filesTemp')).forEach((file) => {
        this.get('files').pushObject(this.get('store').createRecord('file', file));
      });
      this.set('nextDisabled', false);
    }
  },
  nextDisabled: true,
  actions: {
    next() {
      this.set('filesTemp', JSON.stringify(this.get('files')));
      this.sendAction('next');
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
              var reader = new FileReader();
              reader.readAsText(file, 'UTF-8');
              reader.onload = (evt) => { // eslint-disable-line no-loop-func
                file.blob = evt.target.result;
                const newFile = this.get('store').createRecord('file', {
                  name: file.name,
                  mimeType: file.type.substring(file.type.indexOf('/') + 1),
                  description: file.description,
                  fileRole: 'supplemental',
                  uri: 'http://example.com',
                  blob: file.blob,
                });
                if (this.get('files').length === 0) {
                  newFile.set('fileRole', 'manuscript');
                }
                this.get('files').pushObject(newFile);
                if (this.get('files').length === uploads.files.length) {
                  this.set('nextDisabled', checkDisabled(this.get('files')));
                }
              };
              reader.onerror = (evt) => { // eslint-disable-line no-loop-func
                // document.getElementById('fileContents').innerHTML = 'error reading file';
                alert('Error reading file');
              };
            }
          }
        }
      }
    },
    removeFile(file) {
      let files = this.get('files');
      files.removeObject(file);
      this.set('files', files);
      this.set('filesTemp', JSON.stringify(this.get('files')));
      this.set('nextDisabled', checkDisabled(this.get('files')));
    }
  },
});
