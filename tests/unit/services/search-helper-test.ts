import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | search helper', (hooks) => {
  setupTest(hooks);

  /**
   * Actually a bad test because it exercises 3 different service functions :)
   */
  test('unignore an ID', function (assert) {
    const service = this.owner.lookup('service:search-helper');

    const ignore = ['ID-1', 'ID-2', 'ID-3', 'ID-4'];
    ignore.forEach((id: string) => service.ignore(id));

    // Make sure all IDs made it into the ignore list
    ignore.map((id: string) => service.shouldIgnore(id)).every((result: boolean) => assert.ok(result));

    const badId = 'ID-3';
    service.unignore(badId);

    assert.notOk(service.shouldIgnore(badId));
  });
});
