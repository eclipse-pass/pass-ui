import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type PublicationModel from 'pass-ui/models/publication';

module('Unit | Model | publication', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const publication = run(() =>
      (this.owner.lookup('service:store') as Store).createRecord('publication', {}),
    ) as PublicationModel;
    assert.ok(publication);
  });
});
