import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click, triggerKeyEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import ENV from 'pass-ember/config/environment';
import waitForIndexer from 'pass-ember/tests/acceptance-helpers';

module('Acceptance | submissions/index', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    await visit('/login');
    await waitForIndexer();
    await fillIn('input#identification', 'Jane');
    await fillIn('input#password', 'j4n3s_p4$$w0rd!!');
    await click('button#submit');

    await visit('/submissions');
  });

  /*
   * Submissions table:
   *  - Article title is a link that goes to submission detail page
   *  - Grant links go to grant details page
   *  - Contains links to associated grants
   *  - Sort/filter work
   */
  test('submissions table contains data', async (assert) => {
    assert.equal(currentURL(), '/submissions');

    assert.ok(document.querySelector('.models-table-wrapper'), 'There is a submissions table');

    // Check # columns
    const headers = document.querySelectorAll('.models-table-wrapper table thead th');
    assert.equal(headers.length, 7, 'should be 7 columns in the table');

    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    assert.equal(rows.length, 2, 'should be 2 submissions in the table');
  });

  test('submission article title is clickable', async (assert) => {
    assert.equal(currentURL(), '/submissions');

    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    rows.forEach(row => row.querySelectorAll('td').forEach((td, index) => {
      if (index === 0) {
        const titleEl = td.querySelector('a');
        assert.ok(titleEl, 'Title should be an Anchor element');
        assert.ok(titleEl.href.match(/\/submissions\/.+/), 'Title link should lead to submission details page');
      }
    }));
  });

  test('submission award number links go to grant details)', async (assert) => {
    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    rows.forEach(row => row.querySelectorAll('td').forEach((td, index) => {
      if (index === 1) {
        const funderEls = td.querySelectorAll('a');
        if (funderEls.length) {
          funderEls.forEach((link) => {
            assert.ok(link.href.match(/\/grants\/.+/), 'Award number links should lead to grant details page');
          });
        }
      }
    }));
  });

  test('table filter works', async (assert) => {
    const searchBoxSelector = '.models-table-wrapper .globalSearch input.filterString';
    await fillIn(searchBoxSelector, 'eval');
    await triggerKeyEvent(searchBoxSelector, 'keypress', 13); // Enter

    // Ember.run.later(async () => {
    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    assert.equal(rows.length, 1, 'should be one visible row after filter');
    // });
  });
});
