import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession, authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session test', function (hooks) {
  setupApplicationTest(hooks);

  test('authenticating with the correct session data shape results in valid session data', async function (assert) {
    await authenticateSession({
      id: '0',
    });
    await visit('/app');

    assert.equal(currentURL(), '/app');

    let sessionData = currentSession().get('data.authenticated');
    assert.equal(sessionData.id, '0');
  });

  test('authenticating with invalid session data shape still results in valid session data', async function (assert) {
    await authenticateSession({
      user: {
        id: '0',
      },
    });
    await visit('/app');

    assert.equal(currentURL(), '/app');

    let sessionData = currentSession().get('data.authenticated');
    assert.equal(sessionData.id, '0');
  });
});
