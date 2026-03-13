import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type Store from '@ember-data/store';
import type JournalModel from 'pass-ui/models/journal';

module('Unit | Model | journal', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store') as Store;
    const journal = store.createRecord('journal', {}) as JournalModel;
    assert.ok(journal);
  });

  test('it computes pmcParticipation correctly', function (assert) {
    const store = this.owner.lookup('service:store') as Store;
    const methodAJournal = store.createRecord('journal', { pmcParticipation: 'A' }) as JournalModel;
    const methodBJournal = store.createRecord('journal', { pmcParticipation: 'B' }) as JournalModel;

    assert.ok(methodAJournal.isMethodA);
    assert.ok(methodBJournal.isMethodB);
    assert.notOk(methodBJournal.isMethodA);
  });
});
