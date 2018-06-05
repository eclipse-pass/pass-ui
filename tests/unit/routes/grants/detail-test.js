import { moduleFor, test } from 'ember-qunit';

moduleFor('route:grants/detail', 'Unit | Route | grants/detail', {
  // Specify the other units that are required for this test.
  needs: ['service:currentUser']
});

test('it exists', function (assert) {
  let route = this.subject();
  assert.ok(route);
});
