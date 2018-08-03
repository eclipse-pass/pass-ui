import { moduleFor, test } from 'ember-qunit';

moduleFor('service:error-handler', 'Unit | Service | error handler', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Do to errors throwing a page redirect this can not be tested as a unit test.
test('it exists', function (assert) {
  let service = this.subject();
  assert.ok(service);
});
