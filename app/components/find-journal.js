import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),

    onSelect: () => { },

    actions: {

        /** Search for journals by matching a term
         *
         * @param term {string} The search term (regex)
         *
         * TODO:  This simply fetches all journals and iterates through the whole list.
         * It is not suitable for large numbers of journals.  Instead, the server should provide
         * a search API.
        */
        searchJournals(term) {

            var regex = new RegExp(term, 'i');

            return this.get('store').findAll('journal')
                .then((journals) => journals.filter(journal => {
                    return journal.get('name').match(regex);
                }));
        }
    }
});
