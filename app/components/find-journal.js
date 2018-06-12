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
      return this.get('autocomplete').suggest('journalName', term);
    },

    onSelect(selected) {
      this.get('store').findRecord('journal', selected.id).then(journal => this.sendAction('selectJournal', journal));
    }
  },
});
