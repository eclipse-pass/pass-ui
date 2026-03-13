import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type FunderModel from 'pass-ui/models/funder';

module('Unit | Model | funder', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const funder = run(() => (this.owner.lookup('service:store') as Store).createRecord('funder', {})) as FunderModel;
    assert.ok(funder);
  });
});
