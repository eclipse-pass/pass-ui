import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | not-found-error', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let route = this.owner.lookup('route:not-found-error');
    assert.ok(route);
  });
});
