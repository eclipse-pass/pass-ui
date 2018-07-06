import Route from '@ember/routing/route';
import { hash } from 'rsvp';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */
export default Route.extend({
  /**
   * It is possible for unfortunate things to happen somewhere in the backend stack
   * that will result in the returned IDs being unencoded. This Route is setup in
   * the Router to glob match to all '/grants/*'. In the event that unencoded
   * ID is encountered (it will include slashes), simply encode it and replace the
   * current history with the encoded version.
   *
   * https://pass/grants/https:%2F%2Fpass%2Ffcrepo%2Frest%2Fgrants%2F07%2F4b%2F32%2Fa5%2F074b32a5-f1e2-4938-8b3d-c63449145c65
   * https://pass/grants/https://pass/fcrepo/rest/grants/07/4b/32/a5/074b32a5-f1e2-4938-8b3d-c63449145c65
   */
  beforeModel(transition) {
    const intent = transition.intent.url;
    const prefix = '/grants/';

    if (!intent) {
      return;
    }

    const targetId = intent.substring(prefix.length);
    if (targetId.includes('https://')) {
      this.replaceWith(`${prefix}${encodeURIComponent(targetId)}`);
    }
  },
  model(params, transition) {
    if (!params || !params.grant_id) {
      this.replaceWith('/404');
      return;
    }

    let grant = this.get('store').findRecord('grant', params.grant_id);

    const query = {
      term: {
        grants: params.grant_id
      },
      size: 500
    };
    let submissions = this.get('store').query('submission', query);

    // This mapping code is duplicted in submissions/index route.

    // Submission id to array of repoCopy
    let repoCopiesMap = {};

    // Submission id to array of deposit
    let depositsMap = {};

    depositsMap = submissions.then((result) => { // eslint-disable-line
      return this.get('store').query('deposit', {
        from: 0,
        size: 500,
        query: {
          terms: { submission: result.map(s => s.get('id')) }
        }
      });
    }).then((deposits) => {
      let map = {};

      submissions.forEach((s) => {
        map[s.get('id')] = [];
      });

      deposits.forEach(d => map[d.get('submission.id')].push(d));

      return map;
    });

    repoCopiesMap = submissions.then((result) => { // eslint-disable-line
      return this.get('store').query('repositoryCopy', {
        from: 0,
        size: 500,
        query: {
          terms: { publication: result.map(s => s.get('publication.id')) }
        }
      });
    }).then((repoCopies) => {
      let map = {};

      submissions.forEach(s => map[s.get('id')] = []); // eslint-disable-line

      repoCopies.forEach((rc) => {
        let sub = submissions.find(s => s.get('publication.id') == rc.get('publication.id'));

        if (sub) {
          map[sub.get('id')].push(rc);
        }
      });

      return map;
    });

    return hash({
      grant,
      submissions,
      repoCopiesMap,
      depositsMap
    }).catch((error) => {
      this.replaceWith('/404');
    });
  },
});
