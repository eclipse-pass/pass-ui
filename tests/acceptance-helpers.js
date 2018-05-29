import ENV from 'pass-ember/config/environment';
import $ from 'jquery';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doRequests(defer, intervalTime, maxIterations) {
  let iteration = 0;
  // Issuing a search request with no query returns _all_ indexed objects
  const url = ENV.fedora.elasticsearch;
  let prevTotal = -1;

  while (iteration++ < maxIterations) {
    // console.log(`> Checking index for activity: ${url}`);
    let newTotal = await $.ajax(url, 'GET', { // eslint-disable-line
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    }).then(result => result.hits.total);
    // console.log(`> Found time: ${newTotal}`);
    if (Math.abs(newTotal - prevTotal) == 0) {
      defer.resolve(true);
      return;
    }
    prevTotal = newTotal;
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
export default async function waitForIndexer(intervalTime = 1000, maxIterations = 120) {
  let end = Ember.RSVP.defer();
  doRequests(end, intervalTime, maxIterations);
  return end.promise;
}
