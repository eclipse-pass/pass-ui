import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { service } from '@ember/service';
import { fileForSubmissionQuery } from '../../util/paginated-query';
import type SubmissionModel from 'pass-ui/models/submission';
import type FileModel from 'pass-ui/models/file';
import type DepositModel from 'pass-ui/models/deposit';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type RepositoryModel from 'pass-ui/models/repository';

interface DetailModel {
  sub: SubmissionModel;
  files: FileModel[];
  deposits: DepositModel[];
  repoCopies: RepositoryCopyModel[];
  submissionEvents: SubmissionEventModel[];
  repos: RepositoryModel[];
}

export default class DetailRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(params: any): Promise<DetailModel | void> {
    if (!params || !params.submission_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    // const querySize = 500; // TODO: Ignore querysize of 500 for now
    const deposits = this.store.query('deposit', {
      filter: { deposit: `submission.id==${params.submission_id}` },
    });
    const submissionEvents = this.store.query('submission-event', {
      filter: {
        submissionEvent: `submission.id==${params.submission_id}`,
      },
      // sort: '+performedDate',
    });

    const sub = await this.store.findRecord('submission', params.submission_id, {
      include:
        'effectivePolicies,grants.primaryFunder,grants.directFunder,publication.journal,repositories,preparers,submitter',
    });
    const publication = sub.publication;
    const repoCopies = await this.store.query('repository-copy', {
      filter: { repositoryCopy: `publication.id==${publication.id}` },
    });
    const repos = sub.repositories;
    const files = await this.store
      .query('file', fileForSubmissionQuery(params.submission_id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((files: any) => [...files.slice()]);

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
