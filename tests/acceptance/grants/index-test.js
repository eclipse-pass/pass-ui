import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import testScenario from '../../../mirage/scenarios/test';
import ENV from 'pass-ember/config/environment';
import $ from 'jquery';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doRequests(defer, intervalTime, maxIterations) {
  let iteration = 0;
  // See the Elasticsearch _stats API
  // (https://www.elastic.co/guide/en/elasticsearch/reference/6.2/indices-stats.html)
  // Example: curl 'http://localhost:9200/pass/_stats/indexing?pretty'
  const url = ENV.fedora.elasticsearch.replace('_search', '_stats/indexing');
  let indexingTime = -1;

  while (iteration++ < maxIterations) {
    console.log(`> Checking index for activity: ${url}`);

    let newTime = await $.ajax(url, 'GET', { // eslint-disable-line
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    // }).then(result => result.indices.pass.total.indexing.index_time_in_millis);
    }).then(result => result.indices.pass.total.indexing.index_total);
    console.log(`> Found time: ${newTime}`);
    if (Math.abs(newTime - indexingTime) < 3) {
      defer.resolve(true);
      return;
    }
    indexingTime = newTime;
    await sleep(intervalTime); // eslint-disable-line
  }
  defer.reject(true);
}

/**
 * Wait for the Elasticsearch indexer to settle by checking the indexer stats.
 * If the 'index_time_in_millis' has not changed between requests, then proceed.
 *
 * This will require a minimum of 2 requests before resolving, if there is no
 * indexer activity, meaning that 'interval_time' effects every test where
 * this function is used.
 *
 * @param {number} intervalTime time to wait before stats requests
 * @param {number} maxIterations maximum number of tries before giving up
 */
async function waitForIndexer(intervalTime = 500, maxIterations = 120) {
  let end = Ember.RSVP.defer();
  doRequests(end, intervalTime, maxIterations);
  return end.promise;
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

    assert.ok(document.querySelector('.models-table-wrapper'), 'There is a grants table');

    // Check headers
    const headers = document.querySelectorAll('.models-table-wrapper table thead th');
    assert.equal(headers.length, 9, `Should be 9 columns in the table, but found ${headers.length}`);

    // Table has the right number of grants
    const rows = document.querySelectorAll('.models-table-wrapper table tbody tr');
    assert.equal(rows.length, 5, 'There should be 5 grants (rows) in the table');
    // Select grant has required data
    rows.forEach(row => row.querySelectorAll('td').forEach((td, index) => {
      // Columns 0, 1, 2, 4, 7 MUST have data
      switch (index) {
        case 0:
        case 1:
        case 2:
        case 4:
        case 7:
          assert.ok(td.innerText, `Grant table cell (${index}) must have content`);
          break;
        default:
          // Other columns are not required to have data
      }
    }));
  });

  test('Project Name, Award Number, and Submissions # columns are clickable', async (assert) => {
    assert.equal(currentURL(), '/grants');

    document.querySelectorAll('.models-table-wrapper table tbody tr').forEach((row) => {
      let href;
      row.querySelectorAll('td').forEach((td, index) => {
        switch (index) {
          case 0:
          case 2:
          case 7: {
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
