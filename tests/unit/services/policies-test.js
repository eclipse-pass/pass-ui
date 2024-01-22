import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { Response } from 'ember-cli-mirage';

module('Unit | Service | policies', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  let tmp;
  hooks.before(() => {
    tmp = QUnit.onUncaughtException;
    QUnit.onUncaughtException = () => {};
  });

  hooks.after(() => {
    QUnit.onUncaughtException = tmp;
  });

  test('good response returns array of Promises of Policy objects', async function (assert) {
    assert.expect(5);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service exists');

    const sub = { id: '0' };

    const policies = await service.get('getPolicies').perform(sub);

    assert.ok(Array.isArray(policies), 'Should be an array');
    assert.strictEqual(policies.length, 2, 'Should be two policies here');

    assert.strictEqual(policies[0].id, '0', "Expecting text:'Moo'");
    assert.strictEqual(policies[1].id, '5', "Expecting text:'Moo'");
  });

  test('good response to getRepositories returns object with Repository promises by DSL rules', async function (assert) {
    assert.expect(11);

    const service = this.owner.lookup('service:policies');
    assert.ok(service, 'service found');

    const sub = { id: '0' };

    service
      .get('getRepositories')
      .perform(sub)
      .then((rules) => {
        assert.ok(Array.isArray(rules.required), 'rules.required should be an array');
        assert.ok(Array.isArray(rules.optional), 'rules.optional should be an array');
        assert.ok(Array.isArray(rules['one-of']), "rules['one-of'] should be an array");

        assert.strictEqual(rules.required.length, 1, 'Unexpected number of required repos');
        assert.strictEqual(rules.optional.length, 1, 'Unexpected number of optional repos');

        assert.strictEqual(rules['one-of'].length, 1, 'Unexpected number of choice groups');
        assert.strictEqual(rules['one-of'][0].length, 2, 'Unexpected number of repos in choice group 1');

        rules.required.forEach((repo) =>
          assert.strictEqual(repo.name, 'PubMed Central - NATIONAL INSTITUTE OF HEALTH')
        );
        rules.optional.forEach((repo) => assert.strictEqual(repo.name, 'JScholarship'));
        assert.ok(
          rules['one-of'][0].some((repo) => {
            return repo.name === 'JScholarship' || repo.name === 'PubMed Central - NATIONAL INSTITUTE OF HEALTH';
          })
        );
      });
  });

  /**
   * Make sure that invoking the getPolicies function invokes 'fetch' and that
   * a non-2xx response code triggers an error
   */
  test('policy endpoint should throw error on non-200 response', function (assert) {
    assert.expect(1);

    this.server.get('/policy/policies', () => new Response(404));

    const service = this.owner.lookup('service:policies');

    const sub = EmberObject.create({ id: 'moo' });

    service
      .get('getPolicies')
      .perform(sub)
      .catch((e) => {
        assert.ok(e.message.includes('Recieved response 404'));
      });
  });

  /**
   * Make sure that invoking getRepositories function also invokes 'fetch' and that
   * a non-2xx response code triggers an error
   */
  test('repo endpoint should throw error on non-200 response', function (assert) {
    assert.expect(1);

    this.server.get('/policy/repositories', () => new Response(404));

    const service = this.owner.lookup('service:policies');

    const sub = EmberObject.create({ id: 'moo' });

    service
      .get('getRepositories')
      .perform(sub)
      .catch((e) => {
        assert.ok(e.message.includes('Recieved response 404'));
      });
  });
});
