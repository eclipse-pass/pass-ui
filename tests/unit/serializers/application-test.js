import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | application', (hooks) => {
  setupTest(hooks);

  test('it serializes', function (assert) {
    let store = this.owner.lookup('service:store');

    run(() => {
      let record = store.createRecord('submission', {});
      let serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});
