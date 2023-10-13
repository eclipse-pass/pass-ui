import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | journal', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const journal = run(() => this.owner.lookup('service:store').createRecord('journal'));
    assert.ok(journal);
  });
});
