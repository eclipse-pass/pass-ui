import CheckSessionRoute from '../check-session-route';
import { service } from '@ember/service';
import { set } from '@ember/object';
import { hash } from 'rsvp';
import { fileForSubmissionQuery } from '../../util/paginated-query';
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
import type SubmissionsNewController from 'pass-ui/controllers/submissions/new';
import type SubmissionsNewGrantsController from 'pass-ui/controllers/submissions/new/grants';

interface NewSubmissionModel {
  repositories: RepositoryModel[];
  newSubmission: SubmissionModel | null;
  submissionEvents: SubmissionEventModel[] | null;
  publication: PublicationModel | null;
  policies: PolicyModel[];
  preLoadedGrant: GrantModel | null;
  journal: JournalModel | null;
}

export default class NewRoute extends CheckSessionRoute {
  @service('workflow') declare workflow: Workflow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  @service('current-user')
  declare currentUser: CurrentUserService;

  async beforeModel(): Promise<void> {
    this.workflow.resetWorkflow();
    this.router.transitionTo('submissions.new.basics');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetController(controller: any, isExiting: boolean, transition: any): void {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.queryParams.forEach((param: string) => controller.set(param, null));
      this.store.peekAll('submission').forEach((s: SubmissionModel) => s.rollbackAttributes());
    }
  }

  // Return a promise to load count objects starting at offset from of given type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadObjects(type: string, offset: number, count: number): any {
    // TODO: Elide JSON:API filters do not support both page size and page offset
    return this.store.query(type, {
      page: {
        size: count,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(params: any): Promise<NewSubmissionModel> {
    let preLoadedGrant = null;
    let newSubmission = null;
    let submissionEvents = null;
    let publication = null;
    let journal = null;

    if (params.grant) {
      preLoadedGrant = this.store.findRecord('grant', params.grant, {
        include: 'primaryFunder,directFunder',
      });
    }

    const repositories = this.loadObjects('repository', 0, 500);
    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      // Operating on existing submission

      newSubmission = await this.store.findRecord('submission', params.submission, {
        include: 'effectivePolicies,grants.primaryFunder,grants.directFunder,publication.journal,submitter',
      });
      publication = newSubmission.publication;
      journal = publication.journal;

      submissionEvents = this.store.query('submission-event', {
        filter: {
          submissionEvent: `submission.id==${newSubmission.id}`,
        },
        sort: '+performedDate',
      });

      const files = await this.store
        .query('file', fileForSubmissionQuery(newSubmission.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((files: any) => [...files.slice()]);
      this.workflow.setFiles(files);
    } else {
      // Starting a new submission

      publication = this.store.createRecord('publication');

      newSubmission = this.store.createRecord('submission', {
        submissionStatus: 'draft',
      });

      const files: WorkflowFile[] = [];
      this.workflow.setFiles(files);

      if (params.covid) {
        const covidHint = {
          hints: {
            'collection-tags': ['covid'],
          },
        };

        set(newSubmission, 'metadata', JSON.stringify(covidHint));
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupController(controller: any, model: any): void {
    super.setupController(controller, model);

    (controller as SubmissionsNewController).preLoadedGrant = model.preLoadedGrant;
    (this.controllerFor('submissions.new.grants') as SubmissionsNewGrantsController).preLoadedGrant =
      model.preLoadedGrant;
  }
}
