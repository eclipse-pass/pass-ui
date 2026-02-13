/* eslint-disable no-global-assign */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | oaManuscriptService', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:oa-manuscript-service');
    assert.ok(service);
  });
});
