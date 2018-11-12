import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */
export default CheckSessionRoute.extend({
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
    this._super(transition);
    const intent = transition.intent.url;
    const prefix = '/grants/';

    if (!intent) {
      return;
    }

    // encode decoded url, but remove get properties from qs
    if (intent.includes('https://')) {
      let q = intent.indexOf('?');
      if (q == -1) {
        q = intent.length;
      }
      const targetId = intent.substring(prefix.length, q);
      this.replaceWith(`${prefix}${encodeURIComponent(targetId)}`);
    }
  },
  model(params, transition) {
    if (!params || !params.grant_id) {
      this.get('errorHandler').handleError(new Error('didNotLoadData'));
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

    return hash({
      grant,
      submissions
    });
  },
});
