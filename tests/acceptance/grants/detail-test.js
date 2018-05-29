import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click, triggerKeyEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import waitForIndexer from 'pass-ember/tests/acceptance-helpers';

module('Acceptance | grants/detail', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    await visit('/login');
    await waitForIndexer();
    await fillIn('input#identification', 'Jane');
    await fillIn('input#password', 'j4n3s_p4$$w0rd!!');
    await click('button#submit');
  });

  test('contains important grant information', async (assert) => {
    // First go to Grants table, then click on the first Grant name to bring up its details page
    // TODO this relies on working /grants page...
    await visit('/grants');

    const link = document.querySelector('.models-table-wrapper tbody a').href;
    const start = link.indexOf('/grants');
    await visit(link.substring(start)); // Remove the protocol://host:port

    assert.ok(currentURL().match(/\/grants\/.+/));

    const grantData = document.querySelectorAll('.container .row li');
    assert.ok(grantData.length > 0);

    const texts = Array.from(grantData).map(elem => elem.innerText);
    assert.ok(texts.some(txt => txt.match(/Project Name: .+/)), 'should have a Project Name');
    assert.ok(texts.some(txt => txt.match(/Award Number: .+/)), 'should have an Award Number');
    assert.ok(texts.some(txt => txt.match(/PI: .+/)), 'should have a PI');

    assert.ok(document.querySelector('.models-table-wrapper'), 'there is a table for submissions');
    assert.ok(true);
  });
});
