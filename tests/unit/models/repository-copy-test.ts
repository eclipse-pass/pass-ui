import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';

module('Unit | Model | repository copy', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const repositoryCopy = run(() =>
      (this.owner.lookup('service:store') as Store).createRecord('repository-copy', {}),
    ) as RepositoryCopyModel;
    assert.ok(repositoryCopy);
  });
});
