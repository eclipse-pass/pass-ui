import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | policy', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const policy = run(() => this.owner.lookup('service:store').createRecord('policy'));
    assert.ok(policy);
  });
});
