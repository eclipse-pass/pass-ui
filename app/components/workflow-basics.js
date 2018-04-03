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

  init() {
    this._super(...arguments);

  },
  actions: {

    /** looks up the DIO and returns title and journal if avaiable */
    lookupDOI() {
      var submission = this.get('model');
      var self = this;
      if (submission) {
        self.set('doiJournal', false)
        this.get('doiService').resolve(submission).then((doiInfo) => {
          self.set('doiInfo', doiInfo);
          submission.set('title', doiInfo['title']);
          submission.set('submittedDate', doiInfo['deposited']);
          submission.set('creationDate', doiInfo['created']);
          // grab DOI info
          // find the journal that corresponds with the journal name
          // RETURN that journal and save it to the model

          // Search journals for a matching title, for pre-populating purposes
          // If found, we set the submission's journal to it.
          // We also set a property for the journal title, because the json format
          // uses hyphens, and it's unclear how to access them from .hbs templates
          // self.get('store').findAll('journal')
          //   .then((journals) => journals.find(function(journal) {
          //     if (journal.get('name').trim() === doiInfo['container-title'].trim()) {
          //       var doiInfo = self.get('doiInfo');
          //       self.set('doiJournal', true);
          //       self.send('selectJournal', doiInfo['container-title']);
          //     }
          //   }));

          this.get('store').findRecord('journal', {
            filter: {
              name: doiInfo['container-title']
            }
          }).then((journal) => {
            if (!journal) {
              alert('Journal not recognized by our system!');
              // TODO: make a new record for this journal,
              //       set name of journal based on DOI and then
              //       set model.journal equal to that new journal
              journal = this.store.createRecord('journal', {'name': doiInfo['container-title']});
            }
            self.set('model.journal', journal);
          });
        });
      }
    },

    /** Sets the selected journal for the current submission.
     * @param journal {DS.Model} The journal
     */
    selectJournal(journal) {
      var submission = this.get('model');
      return submission.set('journal', journal);
    },
  }
});
