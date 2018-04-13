import Component from '@ember/component';

export default Component.extend({
  files:[],
  actions: {
    next() {
      this.sendAction('next')
    },
    back() {
      this.sendAction('back')
    },
    getFiles(){
      let submission = this.get('model.newSubmission');
      var uploads = document.getElementById("file-multiple-input");
      if ('files' in uploads) {
          if (uploads.files.length !== 0) {
            for (var i = 0; i < uploads.files.length; i++) {
                var file = uploads.files[i];
                // TODO this is weird refactor later down the road
                this.files.pushObject({
                  "file":file,
                  "type":file.type.substring(file.type.indexOf("/") + 1),
                  "description":file.description,
                  "isManuscript":false
                })
            }
            submission.files = this.files
          }
      }
    },
    removeFile(file) {
      let submission = this.get('model.newSubmission');
      this.files.removeObject(file)
      submission.files = this.files
    }
  }
});
