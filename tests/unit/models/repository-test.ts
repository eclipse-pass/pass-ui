import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | repository', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const repository = run(() => this.owner.lookup('service:store').createRecord('repository'));
    assert.ok(repository);
  });
});
