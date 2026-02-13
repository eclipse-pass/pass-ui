import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | repository copy', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const repositoryCopy = run(() => this.owner.lookup('service:store').createRecord('repository-copy'));
    assert.ok(repositoryCopy);
  });
});
