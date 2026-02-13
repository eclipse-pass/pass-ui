import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | application', (hooks) => {
  setupTest(hooks);

  test('it serializes', function (assert) {
    const store = this.owner.lookup('service:store');

    run(() => {
      const record = store.createRecord('submission', {});
      const serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});
