import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | funder', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const funder = run(() => this.owner.lookup('service:store').createRecord('funder'));
    assert.ok(funder);
  });
});
