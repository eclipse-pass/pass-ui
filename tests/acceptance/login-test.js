import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import testScenario from '../../mirage/scenarios/test';

module('Acceptance | login', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should log in', async (assert) => {
    testScenario(server);
    await visit('/login');
    assert.notOk(document.body.querySelector('.accountInfo'), 'User details should not be available before logging in.');
    await fillIn('input#identification', 'Jane');
    await fillIn('input#password', 'myPassword');
    await click('button#submit');
    return wait().then(() => {
      assert.ok(document.body.querySelector('.accountInfo'), 'User details should be available after logging in.');
    });
  });
});
