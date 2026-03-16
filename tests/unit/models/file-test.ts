import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type FileModel from 'pass-ui/models/file';

module('Unit | Model | file', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const file = run(() => (this.owner.lookup('service:store') as Store).createRecord('file', {})) as FileModel;
    assert.ok(file);
  });
});
