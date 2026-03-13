import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type GrantModel from 'pass-ui/models/grant';

module('Unit | Model | grant', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const grant = run(() => (this.owner.lookup('service:store') as Store).createRecord('grant', {})) as GrantModel;
    assert.ok(grant);
  });
});
