import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PowerSelect from 'ember-power-select/components/power-select';
import type AutocompleteService from 'pass-ui/services/autocomplete';
import type JournalModel from 'pass-ui/models/journal';

const eq = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  (task: any) =>
  (...args: any[]) =>
    task.perform(...args);

const DEBOUNCE_MS = 750;

interface FindJournalSignature {
  Args: {
    journalClass: string;
    value: JournalModel | null;
    selectJournal: (journal: JournalModel) => void;
  };
}

export default class FindJournal extends Component<FindJournalSignature> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @service('autocomplete')
  declare autocomplete: AutocompleteService;

  searchJournals = dropTask(async (term: string) => {
    await timeout(DEBOUNCE_MS);
    return this.autocomplete.suggest('journal', 'journalName', term);
  });

  @action
  onSelect(selected: JournalModel) {
    this.store.findRecord('journal', selected.id).then((journal: JournalModel) => this.args.selectJournal(journal));
  }

  <template>
    <PowerSelect
      @triggerClass={{if (eq @journalClass 'is-invalid') 'is-invalid'}}
      @search={{perform this.searchJournals}}
      @searchEnabled={{true}}
      @selected={{@value}}
      @placeholder='Journal'
      data-test-find-journal-select
      @onChange={{this.onSelect}}
      as |journal|
    >
      {{journal.journalName}}
    </PowerSelect>
  </template>
}
