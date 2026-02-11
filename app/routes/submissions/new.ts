import CheckSessionRoute from '../check-session-route';
import { service } from '@ember/service';
import { set } from '@ember/object';
import { hash } from 'rsvp';
import { fileForSubmissionQuery } from '../../util/paginated-query';
import type Workflow from 'pass-ui/services/workflow';
import type CurrentUserService from 'pass-ui/services/current-user';

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.store.peekAll('submission').forEach((s: any) => s.rollbackAttributes());
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
  async model(params: any): Promise<any> {
    let preLoadedGrant = null;
    let newSubmission = null;
    let submissionEvents = null;
    let publication = null;
    let journal = null;

    if (params.grant) {
      preLoadedGrant = this.store.findRecord('grant', params.grant);
    }

    const repositories = this.loadObjects('repository', 0, 500);
    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      // Operating on existing submission

      newSubmission = await this.store.findRecord('submission', params.submission, {
        include: 'publication.journal,submitter',
      });
      publication = await newSubmission.publication;
      journal = await publication.journal;

      submissionEvents = this.store.query('submission-event', {
        filter: {
          submissionEvent: `submission.id==${newSubmission.get('id')}`,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files: any[] = [];
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.controller as any).preLoadedGrant = model.preLoadedGrant;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.controllerFor('submissions.new.grants') as any).preLoadedGrant = model.preLoadedGrant;
  }
}
