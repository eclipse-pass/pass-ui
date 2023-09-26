import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 750;

export default class FindJournal extends Component {
  @service store;

  @service('autocomplete')
  autocomplete;

  /**
   * lookupDOI - Set publication, publication journal, and doiInfo based on DOI.
   *
   * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
   */
  @dropTask
  searchJournals = function* (term) {
    yield timeout(DEBOUNCE_MS);
    return this.autocomplete.suggest('journal', 'journalName', term);
  };

  @action
  onSelect(selected) {
    this.store.findRecord('journal', selected.id).then((journal) => this.args.selectJournal(journal));
  }
}
