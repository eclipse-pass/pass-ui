import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { service } from '@ember/service';
import { query, findRecord } from 'pass-ui/builders/pass-api';
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
    if (!params?.submission_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const depositsPromise = this.store
      .request(query('deposit', { filter: { deposit: `submission.id==${params.submission_id}` } }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => result.content.data);
    const submissionEventsPromise = this.store
      .request(
        query('submission-event', {
          filter: { submissionEvent: `submission.id==${params.submission_id}` },
        }),
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => result.content.data);

    const { content: subContent } = await this.store.request(
      findRecord('submission', params.submission_id, {
        include:
          'effectivePolicies,grants.primaryFunder,grants.directFunder,publication.journal,repositories,preparers,submitter',
      }),
    );
    const sub = subContent.data;
    const publication = sub.publication;
    const { content: repoCopyContent } = await this.store.request(
      query('repository-copy', { filter: { repositoryCopy: `publication.id==${publication.id}` } }),
    );
    const repoCopies = repoCopyContent.data;
    const repos = sub.repositories;
    const { content: fileContent } = await this.store.request(
      query('file', fileForSubmissionQuery(params.submission_id)),
    );
    const files = [...fileContent.data.slice()];

    return hash({
      sub,
      files,
      deposits: depositsPromise,
      repoCopies,
      submissionEvents: submissionEventsPromise,
      repos,
    });
  }
}
