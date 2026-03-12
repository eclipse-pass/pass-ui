import CheckSessionRoute from '../check-session-route';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import { query, findRecord } from 'pass-ui/builders/pass-api';
import { fileForSubmissionQuery } from '../../util/paginated-query';
import type RouterService from '@ember/routing/router-service';
import type Workflow from 'pass-ui/services/workflow';
import type { WorkflowFile } from 'pass-ui/services/workflow';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionModel from 'pass-ui/models/submission';
import type RepositoryModel from 'pass-ui/models/repository';
import type PolicyModel from 'pass-ui/models/policy';
import type PublicationModel from 'pass-ui/models/publication';
import type JournalModel from 'pass-ui/models/journal';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type FileModel from 'pass-ui/models/file';
import type SubmissionsNewController from 'pass-ui/controllers/submissions/new';
import type SubmissionsNewGrantsController from 'pass-ui/controllers/submissions/new/grants';
import type AppStore from 'pass-ui/services/store';

interface NewSubmissionModel {
  repositories: RepositoryModel[];
  newSubmission: SubmissionModel | null;
  submissionEvents: SubmissionEventModel[] | null;
  publication: PublicationModel | null;
  policies: PolicyModel[];
  preLoadedGrant: GrantModel | null;
  journal: JournalModel | null;
}

interface NewSubmissionParams {
  grant?: string;
  submission?: string;
  covid?: string;
}

export default class NewRoute extends CheckSessionRoute {
  @service('workflow') declare workflow: Workflow;
  @service declare store: AppStore;
  @service declare router: RouterService;

  @service('current-user')
  declare currentUser: CurrentUserService;

  async beforeModel(): Promise<void> {
    this.workflow.resetWorkflow();
    this.router.transitionTo('submissions.new.basics');
  }

  resetController(controller: SubmissionsNewController, isExiting: boolean): void {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.queryParams.forEach((param: string) => controller.set(param, null));
      (this.store.peekAll('submission') as SubmissionModel[]).forEach((s: SubmissionModel) => s.rollbackAttributes());
    }
  }

  // Return a promise to load count objects starting at offset from of given type.
  loadObjects<T>(type: string, _offset: number, count: number): Promise<T[]> {
    // TODO: Elide JSON:API filters do not support both page size and page offset
    return this.store
      .request(query(type, { page: { size: count } }))
      .then((result) => (result.content as { data: T[] }).data);
  }

  async model(params: NewSubmissionParams): Promise<NewSubmissionModel> {
    let preLoadedGrant = null;
    let newSubmission = null;
    let submissionEvents = null;
    let publication = null;
    let journal = null;

    if (params.grant) {
      preLoadedGrant = this.store
        .request(findRecord('grant', params.grant, { include: 'primaryFunder,directFunder' }))
        .then((result) => (result.content as { data: GrantModel }).data);
    }

    const repositories = this.loadObjects<RepositoryModel>('repository', 0, 500);
    const policies = this.loadObjects<PolicyModel>('policy', 0, 500);

    if (params.submission) {
      // Operating on existing submission

      const { content: subContent } = await this.store.request(
        findRecord('submission', params.submission, {
          include: 'effectivePolicies,grants.primaryFunder,grants.directFunder,publication.journal,submitter',
        }),
      );
      newSubmission = (subContent as { data: SubmissionModel }).data;
      publication = newSubmission.publication;
      journal = publication.journal;

      submissionEvents = this.store
        .request(
          query('submission-event', {
            filter: { submissionEvent: `submission.id==${newSubmission.id}` },
            sort: '+performedDate',
          }),
        )
        .then((result) => (result.content as { data: SubmissionEventModel[] }).data);

      const { content: fileContent } = await this.store.request(
        query('file', fileForSubmissionQuery(newSubmission.id)),
      );
      const files = [...(fileContent as { data: FileModel[] }).data.slice()] as unknown as WorkflowFile[];
      this.workflow.setFiles(files);
    } else {
      // Starting a new submission

      publication = this.store.createRecord('publication', {}) as PublicationModel;

      newSubmission = this.store.createRecord('submission', {
        submissionStatus: 'draft',
      }) as SubmissionModel;

      const files: WorkflowFile[] = [];
      this.workflow.setFiles(files);

      if (params.covid) {
        const covidHint = {
          hints: {
            'collection-tags': ['covid'],
          },
        };

        newSubmission.metadata = JSON.stringify(covidHint);
      }
    }

    return hash({
      repositories,
      newSubmission,
      submissionEvents,
      publication,
      policies,
      preLoadedGrant,
      journal,
    });
  }

  setupController(controller: SubmissionsNewController, model: NewSubmissionModel): void {
    super.setupController(controller, model);

    controller.preLoadedGrant = model.preLoadedGrant;
    (this.controllerFor('submissions.new.grants') as SubmissionsNewGrantsController).preLoadedGrant =
      model.preLoadedGrant;
  }
}
