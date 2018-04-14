import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';


//
// Sets the the Submission
// - DOI
// - Title
// - journal - // TODO: need to get QueryRecord and createRecord working on adaptor

export default Component.extend({
  doiService: service('doi'),
  store: service('store'),
  doiJournal: false,
  validDOI: 'form-control',
  validTitle: 'form-control',

  init() {
    this._super(...arguments);
  },
  actions: {
    next() {
      this.sendAction('next')
    },
    validateDOI() {
      // ref: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
      const doi = this.get('model.doi');
      const newDOIRegExp = /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
      const ancientDOIRegExp = /^10.1002\/[^\s]+$/i;
      // 0 = no value
      if ( doi == null ) {
        this.set('validDOI', 'form-control')
      } else if ( newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) { // 1 - Accepted
        this.set('validDOI', 'form-control is-valid')
        this.set('validTitle', 'form-control is-valid')
      } else {
        this.set('validDOI', 'form-control is-invalid')
      }
    },
    validateTitle() {
      const title = this.get('model.title');
      this.set('validTitle', title == null || title.length > 5);
      //if(validTitle)
      if(title == null) {
        this.set('validTitle', 'form-control')
      } else if ( title.length > 5 ) {
        this.set('validTitle', 'form-control is-valid')
      } else {
        this.set('validTitle', 'form-control is-invalid')
      }
    },
    /** looks up the DIO and returns title and journal if avaiable */
    lookupDOI() {
      let submission = this.get('model.newSubmission');
      let self = this;
      if (submission) {
        this.send('validateDOI');
        self.set('doiJournal', false)
        this.get('doiService').resolve(submission).then((doiInfo) => {
          self.set('doiInfo', doiInfo);
          console.log(doiInfo)

          submission.set('title', doiInfo['title']);

          submission.set('submittedDate', doiInfo['deposited']);
          submission.set('creationDate', doiInfo['created']);

          submission.set('issue', doiInfo['issue']);
          submission.set('volume', doiInfo['volume']);

          this.set('doiInfo', doiInfo);

          let journal = this.get('model.journals').findBy("name",
            doiInfo['container-title'].trim());
          if (!journal) {
            let newJournal = this.get('store').createRecord('journal', {
              name: doiInfo['container-title'].trim(),
              nlmta: "UNKNOWN"
            })
            newJournal.save().then((j) => submission.set('journal', j));
          } else {
            submission.set('journal', journal);
          }
        });
      }
    },

    /** Sets the selected journal for the current submission.
     * @param journal {DS.Model} The journal
     */
    selectJournal(journal) {
      var submission = this.get('model.newSubmission');
      submission.set('journal', journal);
    },
  }
});
