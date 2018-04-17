import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  doiService: service('doi'),

  store: service('store'),

  doiJournal: null,

  init() {
    this._super(...arguments);
    const submission = this.get('submission');
    const self = this;
    if (submission) {
      this.get('doiService').resolve(submission).then((doiInfo) => {
        self.set('doiInfo', doiInfo);

        // Search journals for a matching title, for pre-populating purposes
        // If found, we set the submission's journal to it.
        // We also set a property for the journal title, because the json format
        // uses hyphens, and it's unclear how to access them from .hbs templates
        self.get('store').findAll('journal')
          .then(journals => journals.find((journal) => {
            const title = journal.get('name');
            const doiTitle = doiInfo['container-title'];
            return title.trim() === doiTitle.trim();
          })).then((match) => {
            const doiInfo = self.get('doiInfo');
            self.set('doiJournal', match);
            self.set('doiJournalTitle', doiInfo['container-title']);
            submission.set('journal', match);
          });
      });
    }
  },
  actions: {

    /** Sets the selected journal for the current submission.
         *
         * @param journal {DS.Model} The journal
         */
    selectJournal(journal) {
      const submission = this.get('submission');
      return submission.set('journal', journal);
    },
  },
});
