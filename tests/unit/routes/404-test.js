import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | 404', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let route = this.owner.lookup('route:404');
    assert.ok(route);
  });
});
