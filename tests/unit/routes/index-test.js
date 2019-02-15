import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | index', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let route = this.owner.lookup('route:index');
    assert.ok(route);
  });
});
