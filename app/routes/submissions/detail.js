import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { service } from '@ember/service';

export default class DetailRoute extends CheckSessionRoute {
  @service store;

  model(params) {
    if (!params || !params.submission_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const sub = this.store.findRecord('submission', params.submission_id);
    // const querySize = 500; // TODO: Ignore querysize of 500 for now
    const files = this.store.query('file', {
      filter: { file: `submission.id==${params.submission_id}` },
    });
    const deposits = this.store.query('deposit', {
      filter: { deposit: `submission.id==${params.submission_id}` },
    });
    const submissionEvents = this.store.query('submissionEvent', {
      filter: {
        submissionEvent: `submission.id==${params.submission_id}`,
      },
      // sort: '+performedDate',
    });
    const repoCopies = sub.then((s) =>
      this.store.query('repositoryCopy', {
        filter: { repositoryCopy: `publication.id==${s.get('publication.id')}` },
      })
    );
    const repos = sub.then((s) => s.get('repositories'));

    return hash({
      sub,
      files,
      deposits,
      repoCopies,
      submissionEvents,
      repos,
    });
  }
}
