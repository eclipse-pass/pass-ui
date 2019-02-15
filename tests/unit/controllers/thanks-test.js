import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | thanks', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:thanks');
    assert.ok(controller);
  });
});
