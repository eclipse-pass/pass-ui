import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { service } from '@ember/service';
import { fileForSubmissionQuery } from '../../util/paginated-query';

export default class DetailRoute extends CheckSessionRoute {
  @service store;

  async model(params) {
    if (!params || !params.submission_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    // const querySize = 500; // TODO: Ignore querysize of 500 for now
    const deposits = this.store.query('deposit', {
      filter: { deposit: `submission.id==${params.submission_id}` },
    });
    const submissionEvents = this.store.query('submissionEvent', {
      filter: {
        submissionEvent: `submission.id==${params.submission_id}`,
      },
      // sort: '+performedDate',
    });

    const sub = await this.store.findRecord('submission', params.submission_id, {
      include: 'publication.journal,repositories,preparers',
    });
    const publication = await sub.get('publication');
    const repoCopies = await this.store.query('repositoryCopy', {
      filter: { repositoryCopy: `publication.id==${publication.id}` },
    });
    const repos = await sub.get('repositories');
    const files = await this.store
      .query('file', fileForSubmissionQuery(params.submission_id))
      .then((files) => [...files.slice()]);

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
