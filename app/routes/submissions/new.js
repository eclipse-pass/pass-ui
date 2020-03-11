import { hash } from 'rsvp';
import CheckSessionRoute from '../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  currentUser: service('current-user'),
  beforeModel() {
    if (this.get('workflow').getCurrentStep() === 0) {
      this.transitionTo('submissions.new');
    }
  },
  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.get('queryParams').forEach(param => controller.set(param, null));
      this.get('store').peekAll('submission').forEach(s => s.rollbackAttributes());
    }
  },

  // Return a promise to load count objects starting at offset from of given type.
  loadObjects(type, offset, count) {
    return this.get('store').query(type, { query: { match_all: {} }, from: offset, size: count });
  },

  async model(params) {
    let preLoadedGrant = null;
    let newSubmission = null;
    let submissionEvents = null;
    let files = null;
    let publication = null;
    let journal = null;

    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    const repositories = this.loadObjects('repository', 0, 500);
    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      // Operating on existing submission

      newSubmission = await this.get('store').findRecord('submission', params.submission);
      publication = await newSubmission.get('publication');
      journal = publication.get('journal');

      submissionEvents = this.get('store').query('submissionEvent', {
        sort: [
          { performedDate: 'asc' }
        ],
        query: {
          term: {
            submission: newSubmission.get('id')
          }
        }
      });

      files = this.get('store').query('file', {
        term: {
          submission: newSubmission.get('id')
        }
      });

      // Also seed workflow.doiInfo with metadata from the Submission
      const metadata = newSubmission.get('metadata');
      if (metadata) {
        this.get('workflow').setDoiInfo(JSON.parse(metadata));
      }
    } else {
      // Starting a new submission

      publication = this.get('store').createRecord('publication');

      newSubmission = this.get('store').createRecord('submission', {
        submissionStatus: 'draft'
      });
    }

    return hash({
      repositories,
      newSubmission,
      submissionEvents,
      publication,
      policies,
      preLoadedGrant,
      files,
      journal
    });
  }
});
