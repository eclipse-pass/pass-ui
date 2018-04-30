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
  files: [],
  init() {
    this._super(...arguments);
    this.set('files', []);
  },
  nextDisabled: true,
  actions: {
    next() {
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
            // TODO this is weird refactor later down the road
            this.get('files').pushObject({
              file,
              type: file.type.substring(file.type.indexOf('/') + 1),
              description: file.description
            });
          }
          submission.set('files', this.get('files'));
          this.set('nextDisabled', checkDisabled(this.get('files')));
        }
      }
    },
    removeFile(file) {
      let files = this.get('files');
      files.removeObject(file);
      this.set('files', files);
      this.set('model.newSubmission.files', this.get('files'));
      this.set('nextDisabled', checkDisabled(this.get('files')));
    }
  },
});
