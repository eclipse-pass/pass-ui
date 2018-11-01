import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';

export default CheckSessionRoute.extend({
  /**
   * It is possible for unfortunate things to happen somewhere in the backend stack
   * that will result in the returned IDs being unencoded. This Route is setup in
   * the Router to glob match to all '/submissions/*'. In the event that unencoded
   * ID is encountered (it will include slashes), simply encode it and replace the
   * current history with the encoded version.
   */
  beforeModel(transition) {
    this._super(transition);
    const intent = transition.intent.url;
    const prefix = '/submissions/';

    if (!intent) {
      return;
    }

    const targetId = intent.substring(prefix.length);
    if (targetId.includes('https://')) {
      this.replaceWith(`${prefix}${encodeURIComponent(targetId)}`);
    }
  },
  model(params) {
    if (!params || !params.submission_id) {
      this.get('errorHandler').handleError(new Error('didNotLoadData'));
      return;
    }

    const querySize = 500;
    const sub = this.get('store').findRecord('submission', params.submission_id);
    const files = this.get('store').query('file', { term: { submission: params.submission_id }, size: querySize });
    const deposits = this.get('store').query('deposit', { term: { submission: params.submission_id }, size: querySize });
    const submissionEvents = this.get('store').query('submissionEvent', {
      sort: [
        { performedDate: 'asc' }
      ],
      query: {
        term: { submission: params.submission_id }
      }
    });
    const repoCopies = sub.then(s =>
      this.get('store').query('repositoryCopy', { term: { publication: s.get('publication.id') }, size: querySize }));
    const repos = sub.then(s => s.get('repositories'));

    return hash({
      sub,
      files,
      deposits,
      repoCopies,
      submissionEvents,
      repos
    });
  },
});
