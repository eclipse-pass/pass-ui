import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type PolicyModel from 'pass-ui/models/policy';

module('Unit | Model | policy', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const policy = run(() => (this.owner.lookup('service:store') as Store).createRecord('policy', {})) as PolicyModel;
    assert.ok(policy);
  });
});
