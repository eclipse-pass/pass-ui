import Component from '@ember/component';

export default Component.extend({
  files:[],
  actions: {
    getFiles(){
      let submission = this.get('model');
      var uploads = document.getElementById("file-multiple-input");
      if ('files' in uploads) {
          if (uploads.files.length !== 0) {
            for (var i = 0; i < uploads.files.length; i++) {
                var file = uploads.files[i];
                this.files.pushObject(file)
                console.log(this.files)
            }
            submission.files = this.files
          }
        //  submission.files = this.files
          console.log(uploads, submission.files)
      }
    },
    removeFile(file) {
      let submission = this.get('model');
      this.files.removeObject(file)
      submission.files = this.files
    }
  }
});
