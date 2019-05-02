import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | grants/detail', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let route = this.owner.lookup('route:grants/detail');
    assert.ok(route);
  });
});
