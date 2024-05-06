import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession, authenticateSession } from 'ember-simple-auth/test-support';
import sharedScenario from '../../mirage/scenarios/shared';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | session', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('authenticating with the correct session data shape results in valid session data', async function (assert) {
    await authenticateSession({
      id: '0',
    });

    sharedScenario(this.server);

    await visit('/app');

    let sessionData = currentSession().get('data.authenticated');
    assert.equal(sessionData.id, '0');
  });
});
