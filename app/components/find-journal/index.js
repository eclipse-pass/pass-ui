import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class FindJournal extends Component {
  @service store;

  @service('autocomplete')
  autocomplete;

  /**
   * Search for journals by autocompleting based on the term prefix.
   *
   * @param {string} term  The search term
   * @returns {array} array of Journals
   */
  @action
  searchJournals(term) {
    return this.autocomplete.suggest('journal', 'journalName', term);
  }

  @action
  onSelect(selected) {
    this.store.findRecord('journal', selected.id).then((journal) => this.args.selectJournal(journal));
  }
}
