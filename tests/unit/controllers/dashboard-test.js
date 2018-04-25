import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:dashboard', 'Unit | Controller | dashboard', {
  // Specify the other units that are required for this test.
  needs: ['service:current-user']
});

// Replace this with your real tests.
test('it exists', function (assert) {
  let controller = this.subject();
  assert.ok(controller);
});
