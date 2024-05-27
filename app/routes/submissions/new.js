import CheckSessionRoute from '../check-session-route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { hash } from 'rsvp';
import { fileForSubmissionQuery } from '../../util/paginated-query';

export default class NewRoute extends CheckSessionRoute {
  @service('workflow')
  workflow;
  @service store;
  @service router;

  @service('current-user')
  currentUser;

  beforeModel() {
    if (this.workflow.getCurrentStep() === 0) {
      this.router.transitionTo('submissions.new');
    }
  }

  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.queryParams.forEach((param) => controller.set(param, null));
      this.store.peekAll('submission').forEach((s) => s.rollbackAttributes());
    }
  }

  // Return a promise to load count objects starting at offset from of given type.
  loadObjects(type, offset, count) {
    // TODO: Elide JSON:API filters do not support both page size and page offset
    return this.store.query(type, {
      page: {
        size: count,
      },
    });
  }

  async model(params) {
    let preLoadedGrant = null;
    let newSubmission = null;
    let submissionEvents = null;
    let files = null;
    let publication = null;
    let journal = null;

    if (params.grant) {
      preLoadedGrant = this.store.findRecord('grant', params.grant);
    }

    const repositories = this.loadObjects('repository', 0, 500);
    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      // Operating on existing submission

      newSubmission = await this.store.findRecord('submission', params.submission);
      publication = await newSubmission.get('publication');
      journal = publication.get('journal');

      submissionEvents = this.store.query('submissionEvent', {
        filter: {
          submissionEvent: `submission.id==${newSubmission.get('id')}`,
        },
        sort: '+performedDate',
      });

      files = this.store.query('file', fileForSubmissionQuery(newSubmission.id)).then((files) => [...files.slice()]);

      // Also seed workflow.doiInfo with metadata from the Submission
      const metadata = newSubmission.get('metadata');
      if (metadata) {
        this.workflow.setDoiInfo(JSON.parse(metadata));
      }
    } else {
      // Starting a new submission

      publication = this.store.createRecord('publication');

      newSubmission = this.store.createRecord('submission', {
        submissionStatus: 'draft',
      });

      files = [];

      if (params.covid) {
        let covidHint = {
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
      files,
      journal,
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    this.controller.preLoadedGrant = model.preLoadedGrant;
    this.controllerFor('submissions.new.grants').preLoadedGrant = model.preLoadedGrant;
  }
}
