/* eslint-disable ember/no-get */
import { isArray } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import { task } from 'ember-concurrency-decorators';
import { get } from '@ember/object';
import { fileForSubmissionQuery, submissionsWithPublicationQuery } from '../util/paginated-query';

/**
 * Service to manage submissions.
 */
export default class SubmissionHandlerService extends Service {
  @service store;
  @service currentUser;
  @service('metadata-schema') schemaService;

  /**
   * Get all repositories associated with grants.
   *
   * @param {EmberArray} grant list of Grants
   * @returns EmberArray with repositories
   */
  getRepositoriesFromGrants(grants) {
    let result = [];

    grants.forEach((grant) => {
      const directRepos = grant.get('directFunder.policy.repositories');
      const primaryRepos = grant.get('primaryFunder.policy.repositories');

      if (isArray(directRepos)) {
        result.push(directRepos.slice());
      }
      if (isArray(primaryRepos)) {
        result.push(primaryRepos.slice());
      }
    });

    return result.compact().uniqBy('id');
  }

  /**
   * _getSubmissionView - Internal method which returns the URL to view a submission.
   *
   * @param  {Submission} submission
   * @returns {string} URL to submission details page
   */
  _getSubmissionView(submission) {
    let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');

    return `${baseURL}${ENV.rootURL}submissions/${encodeURIComponent(`${submission.id}`)}`;
  }

  /**
   * _finishSubmission - Internal method to finish a submission which has had all
   *   its files uploaded. Adds a submitted event with the given comment. Submission
   *   is either prepared or actually submitted. If actually submitted, web-link
   *   repos are removed.
   *
   * @param  {Submission} submission
   * @param  {string} comment    Added to SubmissionEvent
   * @returns {Promise}          Promise resolves to the updated submission.
   */
  @task
  _finishSubmission = function* (submission, comment) {
    let subEvent = yield get(this, 'store').createRecord('submissionEvent');

    subEvent.set('performedBy', get(this, 'currentUser.user'));
    subEvent.set('comment', comment);
    subEvent.set('performedDate', new Date());
    subEvent.set('submission', submission);
    subEvent.set('link', this._getSubmissionView(submission));

    // If the person clicking submit *is* the submitter, actually submit the submission.
    if (submission.get('submitter.id') === get(this, 'currentUser.user.id')) {
      submission.set('submitted', true);
      submission.set('submissionStatus', 'submitted');
      submission.set('submittedDate', new Date());

      const repos = yield submission.repositories;
      // Add agreements metadata
      const agreemd = get(this, 'schemaService').getAgreementsBlob(repos);

      if (agreemd) {
        let md = JSON.parse(submission.get('metadata'));
        get(this, 'schemaService').mergeBlobs(md, agreemd);
        submission.set('metadata', JSON.stringify(md));
      }

      subEvent.set('performerRole', 'submitter');
      subEvent.set('eventType', 'submitted');
    } else {
      // If they *aren't* the submitter, they're the preparer.
      submission.set('submissionStatus', 'approval-requested');
      subEvent.set('performerRole', 'preparer');

      // If a submitter is specified, it's a normal "approval-requested" scenario.
      if (submission.get('submitter.id')) {
        subEvent.set('eventType', 'approval-requested');
      } else if (submission.get('submitterName') && submission.get('submitterEmail')) {
        // If not specified but a name and email are prsent, create a mailto link.
        subEvent.set('eventType', 'approval-requested-newuser');
      }
    }

    // Save the updated submission, then save the submissionEvent
    yield subEvent.save();
    yield submission.save();
  };

  /**
   * submit - Perform or prepares a submission. Persists the publication, associate
   *   the submission with the saved publication, modify the submission appropriately,
   *   and finally persists the submission with an appropraite event
   *   to hold the comment. Repositories of type web-link are removed if submission
   *   is actually submitted.
   *
   *   Files are already uploaded during the Files step of the workflow, so they do not
   *   need to be handled here.
   *
   * @param  {Submission} submission
   * @param  {Publication} publication Persisted and associated with Submission.
   * @param  {String} comment          Comment added as to SubmissionEvent.
   * @returns {Promise}                Promise to perform the operation.
   */
  @task
  submit = function* (submission, publication, files, comment) {
    const p = yield publication.save();

    submission.set('submitted', false);
    submission.set('source', 'pass');
    submission.set('aggregatedDepositStatus', 'not-started');
    submission.set('publication', p);

    const s = yield submission.save();
    yield get(this, '_finishSubmission')
      .perform(s, comment)
      .catch((e) => {
        throw e;
      });
  };

  /**
   * approveSubmission - Submitter approves submission. Metadata is added to
   *  external-submissions for all web-link repos and those repos are removed.
   *  Attaches a SubmissionEvent of type submitted with the given comment and
   *  sets the status of the Submission to changes-requested.
   *
   * @param  {Submission} submission
   * @param  {string} comment  Comment is added to SubmissionEvent.
   * @returns {Promise}        Promise which performs the operation.
   */
  approveSubmission(submission, comment) {
    // Add agreements metadata
    const agreemd = this.schemaService.getAgreementsBlob(submission.get('repositories'));

    if (agreemd) {
      let md = JSON.parse(submission.get('metadata'));
      this.schemaService.mergeBlobs(md, agreemd);
      submission.set('metadata', JSON.stringify(md));
    }

    let se = this.store.createRecord('submissionEvent', {
      submission,
      performedBy: get(this, 'currentUser.user'),
      performedDate: new Date(),
      comment,
      performerRole: 'submitter',
      eventType: 'submitted',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'submitted');
      submission.set('submittedDate', new Date());
      submission.set('submitted', true);
      return submission.save();
    });
  }

  /**
   * requestSubmissionChanges - Request that submission be changed before approval
   *  on behalf of submitter. Attaches a SubmissionEvent of type changes-requested
   *  with the given comment and sets the status of the Submission to changes-requested.
   *
   * @param  {Submission} submission
   * @param  {string} comment    Comment is added to submission event.
   * @returns {Promise}          Promise which performs the operation.
   */
  requestSubmissionChanges(submission, comment) {
    let se = this.store.createRecord('submissionEvent', {
      submission,
      comment,
      performedBy: submission.get('submitter'),
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'changes-requested',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'changes-requested');
      return submission.save();
    });
  }

  /**
   * cancelSubmission - Cancel a prepared submission on behalf of submitter.
   *  Attaches a SubmissionEvent of type cancelled with the given comment and
   *  sets the status of the Submission to cancelled.
   *
   * @param  {Submission} submission
   * @param  {string} comment      Comment is added to SubmissionEvent.
   * @returns {Promise}            Promise which performs the operation.
   */
  cancelSubmission(submission, comment) {
    let se = this.store.createRecord('submissionEvent', {
      submission,
      comment,
      performedBy: submission.get('submitter'),
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'cancelled',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'cancelled');
      return submission.save();
    });
  }

  /**
   * Delete a draft submission. Any attached files will be deleted and the attached
   * Publication will be deleted if it is not referenced by any other submissions.
   *
   * - First ensure submission source is pass and submission status is draft
   * - Delete Files
   * - Delete linked Publication only if no other submissions reference it
   * - Delete the Submission only if all of the above succeed
   *
   * Will reject operation if the specified submission is NOT in 'draft' status
   *
   * Will pass errors from all of the network interactions:
   *  - File deletions
   *  - Publication deletion
   *  - Submission deletion
   *
   * @param {Submission} submission submission to delete
   * @returns {Promise} that returns once the submission deletion is persisted
   */
  async deleteSubmission(submission) {
    if (submission.source !== 'pass' || submission.submissionStatus !== 'draft') {
      return Promise.reject(`Non-DRAFT submissions cannot be deleted`);
    }

    // Get submissions for this file
    const files = await this.store.query('file', fileForSubmissionQuery(submission.id));
    await Promise.all(files.map((file) => file.destroyRecord()));

    const publication = await submission.publication;

    // Search for Submissions that reference this publication
    const submissionId = submission.id;
    submission.deleteRecord();
    await submission.save();

    const subsWithThisPublication = await this.store.query('submission', submissionsWithPublicationQuery(publication));
    if (subsWithThisPublication.length === 0) {
      publication.deleteRecord();
      await publication.save();
    }
  }
}
