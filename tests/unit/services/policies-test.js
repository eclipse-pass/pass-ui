import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | policies', (hooks) => {
  setupTest(hooks);

  test('good response returns array of Promises of Policy objects', async function (assert) {
    assert.expect(8);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    const store = Ember.Object.create({
      findRecord(type, id) {
        assert.ok(true);
        return Promise.resolve(Ember.Object.create({ text: 'Moo' }));
      }
    });

    service.set('store', store);

    fetch = () => Promise.resolve({
      ok: true,
      json() {
        assert.ok(true);
        return Promise.resolve([{ type: 'Moo' }, { type: 'Moo2' }]);
      }
    });

    const sub = Ember.Object.create({ id: 'moo_id' });

    const policies = await service.getPolicies(sub);

    assert.ok(Array.isArray(policies), 'Should be an array');
    assert.equal(policies.length, 2, 'Should be two policies here');

    policies.forEach(policy => assert.equal(policy.get('text'), 'Moo', 'Expecting text:\'Moo\''));
  });

  test('good response to getRepositories returns object with Repository promises by DSL rules', function (assert) {
    assert.expect(17);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service not found');

    const store = Ember.Object.create({
      findRecord(type, id) {
        assert.ok(true);
        return Promise.resolve(Ember.Object.create({ text: 'Moo' }));
      }
    });

    service.set('store', store);

    fetch = () => Promise.resolve({
      ok: true,
      json() {
        assert.ok(true);
        return Promise.resolve({
          required: [{ text: 'Moo' }],
          'one-of': [
            [{ text: 'Moo2' }, { text: 'Moo3' }]
          ],
          optional: [{ text: 'Moo 4' }]
        });
      }
    });

    const sub = Ember.Object.create({ id: 'moo_id' });

    service.getRepositories(sub).then((rules) => {
      assert.ok(Array.isArray(rules.required), 'rules.required should be an array');
      assert.ok(Array.isArray(rules.optional), 'rules.optional should be an array');
      assert.ok(Array.isArray(rules['one-of']), 'rules[\'one-of\'] should be an array');

      assert.equal(rules.required.length, 1, 'Unexpected number of required repos');
      assert.equal(rules.optional.length, 1, 'Unexpected number of optional repos');
      assert.equal(rules['one-of'].length, 1, 'Unexpected number of choice groups');
      assert.equal(rules['one-of'][0].length, 2, 'Unexpected number of repos in choice group 1');

      rules.required.forEach(repo => assert.equal(repo.get('text'), 'Moo'));
      rules.optional.forEach(repo => assert.equal(repo.get('text'), 'Moo'));
      rules['one-of'].forEach(group => group.forEach(repo => assert.equal(repo.get('text'), 'Moo')));
    });
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
