import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | grant', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const grant = run(() => this.owner.lookup('service:store').createRecord('grant'));
    assert.ok(grant);
  });
});
