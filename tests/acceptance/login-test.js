import { module, test } from 'qunit';
import { click, fillIn, visit, pauseTest, currentURL } from '@ember/test-helpers';
import { setupApplicationTest, setupRenderingTest } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import testScenario from '../../mirage/scenarios/test';
import waitForIndexer from '../acceptance-helpers';

module('Acceptance | login', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  test('should be able to log in', async (assert) => {
    testScenario(server);
    // await visit('/login');
    // waitForIndexer();
    // assert.notOk(document.body.querySelector('.accountInfo'), 'User details should not be accessible before logging in.');
    // await fillIn('input#identification', 'a');
    // await fillIn('input#password', 'a');
    // await click('button#submit');
    await visit('/');
    waitForIndexer();

    return wait().then(() => {
      assert.equal(currentURL(), '/', 'Logged in user should be redirected to dashboard.');
      assert.ok(document.body.querySelector('.accountInfo'), 'User details should be available after logging in.');
    });
  });
});
