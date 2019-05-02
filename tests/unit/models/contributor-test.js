import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | contributor', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const contributor = run(() => this.owner.lookup('service:store').createRecord('contributor'));
    assert.ok(contributor);
  });
});
