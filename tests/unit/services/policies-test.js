import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | policies', (hooks) => {
  setupTest(hooks);

  test('good response to getPolicies calls "#json()" of the response', function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    fetch = () => Promise.resolve({
      ok: true,
      json() {
        assert.ok(true);
        return Promise.resolve({ text: 'Moo' });
      }
    });

    const sub = Ember.Object.create({ id: 'moo_id' });

    service.getPolicies(sub).then(res => assert.equal(res.text, 'Moo', 'Unexpected result found'));
  });

  test('good response to getRepositories calls "#json()" of the response', function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    fetch = () => Promise.resolve({
      ok: true,
      json() {
        assert.ok(true);
        return Promise.resolve({ text: 'Moo' });
      }
    });

    const sub = Ember.Object.create({ id: 'moo_id' });

    service.getRepositories(sub).then(res => assert.equal(res.text, 'Moo', 'Unexpected result found'));
  });

  /**
   * Make sure that invoking the getPolicies function invokes 'fetch' and that
   * a non-2xx response code triggers an error
   */
  test('policy endpoint should throw error on non-200 response', function (assert) {
    assert.expect(3);

    fetch = () => Promise.resolve({
      ok: false,
      status: 403
    }).then((ans) => {
      assert.ok(true); // Just to make sure this is run
      return ans;
    });

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    const sub = Ember.Object.create({ id: 'moo' });

    service.getPolicies(sub).catch(e => assert.ok(e.message.includes('403')));
  });

  /**
   * Make sure that invoking getRepositories function also invokes 'fetch' and that
   * a non-2xx response code triggers an error
   */
  test('repo endpoint should throw error on non-200 response', function (assert) {
    assert.expect(3);

    fetch = () => Promise.resolve({
      ok: false,
      status: 404
    }).then((ans) => {
      assert.ok(true);
      return ans;
    });

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    const sub = Ember.Object.create({ id: 'moo' });

    service.getRepositories(sub).catch(e => assert.ok(e.message.includes('404'), 'unexpected error caught'));
  });
});
