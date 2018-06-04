import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import testScenario from '../../../mirage/scenarios/test';
import waitForIndexer from 'pass-ember/tests/acceptance-helpers';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module('Acceptance | grants/index', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    // testScenario(server);
    await visit('/login');
    await waitForIndexer();
    await fillIn('input#identification', 'Jane');
    await fillIn('input#password', 'j4n3s_p4$$w0rd!!');
    await click('button#submit');

    await visit('/grants');
  });

  test('Grants table renders correctly', async (assert) => {
    assert.equal(currentURL(), '/grants');
    // await sleep(5000);
    // waitForIndexer();
    assert.ok(document.querySelector('.models-table-wrapper'), 'There is a grants table');

    // Check headers
    const headers = document.querySelectorAll('.models-table-wrapper table thead th');
    assert.equal(headers.length, 8, `Should be 8 columns in the table, but found ${headers.length}`);

    // Table has the right number of grants
    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    // assert.equal(rows.length, 5, 'There should be 5 grants (rows) in the table');
    assert.ok(rows.length > 0, 'should have some grants');
    // Select grant has required data
    rows.forEach(row => row.querySelectorAll('td').forEach((td, index) => {
      // Columns 0, 1, 2, 4, 7 MUST have data
      switch (index) {
        case 0:
        case 1:
        case 2:
        case 5:
          assert.ok(td.innerText, `Grant table cell (${index}) must have content`);
          break;
        default:
          // Other columns are not required to have data
      }
    }));
    assert.ok(true);
  });

  test('Project Name, Award Number, and Submissions # columns are clickable', async (assert) => {
    assert.equal(currentURL(), '/grants');
    // await sleep(5000);

    document.querySelectorAll('.models-table-wrapper table tbody tr').forEach((row) => {
      let href;
      row.querySelectorAll('td').forEach((td, index) => {
        switch (index) {
          case 0:
          case 2:
          case 4: {
            const html = td.querySelector('a');
            assert.ok(html, 'Cell must contain an Anchor tag');
            assert.ok(html.href, 'Cell must have an href');
            if (!href) {
              href = html.href;
            } else {
              // TODO might be too strict of a check?
              assert.equal(html.href, href, 'Links for a grant must lead to the same place');
            }
            break;
          }
          default:
        }
      });
    });
    assert.ok(true);
  });

  // test('Column sorting works', async (assert) => {
  //   async function checkSort(index) {
  //     let state = [];
  //     await click(`.models-table table thead tr:nth-child(${index})`);
  //   }

  //   const headers = document.querySelector('.models-table table thead tr');
  //   for (let i = 0; i < headers.length; i++) {
  //     checkSort(i);
  //   }
  // });
});
