import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type RepositoryModel from 'pass-ui/models/repository';

module('Unit | Model | repository', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const repository = run(() =>
      (this.owner.lookup('service:store') as Store).createRecord('repository', {}),
    ) as RepositoryModel;
    assert.ok(repository);
  });
});
