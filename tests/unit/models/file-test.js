import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | file', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const file = run(() => this.owner.lookup('service:store').createRecord('file'));
    assert.ok(file);
  });
});
