import Component from '@ember/component';
import { inject as service } from '@ember/service';

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
             this.get('doiService').resolve(submission).then(function (doiInfo) {
                 self.set('doiInfo', doiInfo);

                 // Search journals for a matching title, for pre-populating purposes
                 // If found, we set the submission's journal to it.
                 // We also set a property for the journal title, because the json format
                 // uses hyphens, and it's unclear how to access them from .hbs templates
                 self.get('store').findAll('journal')
                     .then((journals) => journals.find(function (journal) {
                         var title = journal.get('name');
                         var doiTitle = doiInfo['container-title'];
                         return title.trim() === doiTitle.trim();
                     })).then(function (match) {
                         var doiInfo = self.get('doiInfo');
                         //self.set('doiJournal', match);
                        console.log(doiInfo)
                        submission.set('title', doiInfo['title']);

                        self.set('doiJournal', true)
                        self.send('selectJournal', doiInfo['container-title'])
                        // self.store.findRecord('journal', params.post_id, {include: 'comments'});
                     })
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
