import { getContext } from '@ember/test-helpers';

module('Unit | Service | metadata-schema', (hooks) => {
  setupTests(hooks);

  const mockAjax = {
    request() {
      const res = new Promise();
      res.resolve('moo');
      return res;
    }
  };

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    assert.ok(service);
  });
});
