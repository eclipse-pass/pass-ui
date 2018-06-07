import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  autocomplete: service('autocomplete'),

  actions: {

    /**
     * Search for journals by autocompleting based on the term prefix.
     *
     * @param term {string} The search term
     * @returns {array} array of objects
     *                  {
     *                    id: `string ID of the associated Journal model object`
     *                    ... // properties from the source document in the search index
     *                  }
     */
    searchJournals(term) {
      // return this.get('autocomplete').suggest('journalName', term);
      /*
       * TODO BELOW MUST BE REMOVED WHEN JOURNAL DATA IS UPDATED
       * > This function should be updated to use autocomplete
       * > 'workflow-basic.js#validateNext' should be updated by removing the journal.name check
       * > 'find-journal.hbs' should be updated to remove the journal.name reference
       */
      return this.get('store').query('journal', {
        query: {
          bool: {
            should: [
              { term: { name: term } }, // Shouldn't be necessary, but the 'assets' container looks like it has old data
              { term: { journalName: term } }
            ]
          }
        },
        size: 100
      });
    },

    onSelect(selected) {
      this.get('store').findRecord('journal', selected.id).then(journal => this.sendAction('selectJournal', journal));
    }
  },
});
