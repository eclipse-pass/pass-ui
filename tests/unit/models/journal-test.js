import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | journal', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const journal = store.createRecord('journal');
    assert.ok(journal);
  });

  test('it computes pmcParticipation correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    const methodAJournal = store.createRecord('journal', { pmcParticipation: 'A' });
    const methodBJournal = store.createRecord('journal', { pmcParticipation: 'B' });

    assert.ok(methodAJournal.isMethodA);
    assert.ok(methodBJournal.isMethodB);
    assert.notOk(methodBJournal.isMethodA);
  });
});
