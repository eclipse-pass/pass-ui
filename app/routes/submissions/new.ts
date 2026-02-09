import CheckSessionRoute from '../check-session-route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { hash } from 'rsvp';
import { fileForSubmissionQuery } from '../../util/paginated-query';

export default class NewRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('workflow') declare workflow: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  @service('current-user')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare currentUser: any;

  beforeModel(): void {
    this.workflow.resetWorkflow();
    this.router.transitionTo('submissions.new.basics');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetController(controller: any, isExiting: boolean, transition: any): void {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.queryParams.forEach((param) => controller.set(param, null));
      this.store.peekAll('submission').forEach((s) => s.rollbackAttributes());
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

      submissionEvents = this.store.query('submissionEvent', {
        filter: {
          submissionEvent: `submission.id==${newSubmission.get('id')}`,
        },
        sort: '+performedDate',
      });

      const files = await this.store
        .query('file', fileForSubmissionQuery(newSubmission.id))
        .then((files) => [...files.slice()]);
      this.workflow.setFiles(files);
    } else {
      // Starting a new submission

      publication = this.store.createRecord('publication');

      newSubmission = this.store.createRecord('submission', {
        submissionStatus: 'draft',
      });

      const files = [];
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

    this.controller.preLoadedGrant = model.preLoadedGrant;
    this.controllerFor('submissions.new.grants').preLoadedGrant = model.preLoadedGrant;
  }
}
