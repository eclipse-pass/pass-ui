import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | publication', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const publication = run(() => this.owner.lookup('service:store').createRecord('publication'));
    assert.ok(publication);
  });
});
