import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL, pauseTest, triggerKeyEvent } from '@ember/test-helpers';
import { setupApplicationTest, setupTest } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import testScenario from '../../../mirage/scenarios/test';
import waitForIndexer from 'pass-ember/tests/acceptance-helpers';

module('Acceptance | submission/new', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should be able to create new submission', async (assert) => {
    // testScenario(server);
    // log in
    await visit('/submissions/new');
    waitForIndexer();

    // // fill out basics
    await fillIn('input#doi', '10.1021/acsmedchemlett.7b00397');
    // Ember.run(() => {
    triggerKeyEvent('input#doi', 'keyup', 32);
    // });
    // assert.ok(true);
    return Ember.run.later(async () => { // wait for async to resolve
      await click('button.next');
      // // GRANTS:
      // // await click('span.ember-power-select-placeholder');
      // // await fillIn('input.ember-power-select-search-input', 'Food');
      // // await click('li.ember-power-select-option');
      // await click('button.next');
      // // POLICIES:
      // // code goes here
      // await click('button.next');
      // return pauseTest();

      // // REPOSITORIES:
      // // code goes here
      // await click('button.next');
      // // Metadata 1 (Common):
      // // code goes here
      // await click('button.next');
      // // Metdata 2 (JHU):
      // // code goes here
      // await click('button.next');
      // FILES:
      // code goes here
      assert.ok(true);
    }, 1000);
  //   // return pauseTest();
  });
});
