
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';


export default class DetailRoute extends CheckSessionRoute {
  model(params) {
    if (!params || !params.submission_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const querySize = 500;
    const sub = this.store.findRecord('submission', params.submission_id);
    const files = this.store.query('file', { term: { submission: params.submission_id }, size: querySize });
    const deposits = this.store.query('deposit', { term: { submission: params.submission_id }, size: querySize });
    const submissionEvents = this.store.query('submissionEvent', {
      sort: [
        { performedDate: 'asc' }
      ],
      query: {
        term: { submission: params.submission_id }
      }
    });
    const repoCopies = sub.then(s =>
      this.store.query('repositoryCopy', { term: { publication: s.get('publication.id') }, size: querySize }));
    const repos = sub.then(s => s.get('repositories'));

    return hash({
      sub,
      files,
      deposits,
      repoCopies,
      submissionEvents,
      repos
    });
  }
}
