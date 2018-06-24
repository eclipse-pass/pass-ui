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
  model(params) {
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
    });
  },
});
