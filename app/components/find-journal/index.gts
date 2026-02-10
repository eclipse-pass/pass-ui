import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PowerSelect from 'ember-power-select/components/power-select';

const eq = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  (task: any) =>
  (...args: any[]) =>
    task.perform(...args);

const DEBOUNCE_MS = 750;

export default class FindJournal extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @service('autocomplete')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare autocomplete: any;

  searchJournals = dropTask(async (term: string) => {
    await timeout(DEBOUNCE_MS);
    return this.autocomplete.suggest('journal', 'journalName', term);
  });

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect(selected: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.store.findRecord('journal', selected.id).then((journal: any) => (this.args as any).selectJournal(journal));
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
