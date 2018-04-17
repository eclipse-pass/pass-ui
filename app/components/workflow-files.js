import Component from '@ember/component';

export default Component.extend({
  files: [],
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
            this.files.pushObject({
              file,
              type: file.type.substring(file.type.indexOf('/') + 1),
              description: file.description,
              isManuscript: false,
            });
          }
          submission.files = this.files;
        }
      }
    },
    removeFile(file) {
      const submission = this.get('model.newSubmission');
      this.files.removeObject(file);
      submission.files = this.files;
    },
  },
});
