import Service, { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import { task } from 'ember-concurrency';
import { query } from 'pass-ui/builders/pass-api';
import { fileForSubmissionQuery, submissionsWithPublicationQuery } from '../util/paginated-query';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type GrantModel from 'pass-ui/models/grant';
import type RepositoryModel from 'pass-ui/models/repository';
import type FileModel from 'pass-ui/models/file';
import type CurrentUserService from 'pass-ui/services/current-user';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';

/**
 * Service to manage submissions.
 */
export default class SubmissionHandlerService extends Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  @service declare currentUser: CurrentUserService;
  @service('metadata-schema') declare schemaService: MetadataSchemaService;

  /**
   * Get all repositories associated with grants.
   *
   * @param {EmberArray} grant list of Grants
   * @returns EmberArray with repositories
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRepositoriesFromGrants(grants: GrantModel[]): RepositoryModel[] {
    const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    grants.forEach((grant) => {
      const directRepos = grant.directFunder?.policy?.repositories;
      const primaryRepos = grant.primaryFunder?.policy?.repositories;

      if (Array.isArray(directRepos)) {
        result.push(directRepos.slice());
      }
      if (Array.isArray(primaryRepos)) {
        result.push(primaryRepos.slice());
      }
    });

    return [...new Map(result.filter(Boolean).map((x: any) => [x.id, x])).values()]; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /**
   * _getSubmissionView - Internal method which returns the URL to view a submission.
   *
   * @param  {Submission} submission
   * @returns {string} URL to submission details page
   */
  _getSubmissionView(submission: SubmissionModel): string {
    const baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');

    const encodedId = encodeURIComponent(String(submission.id));
    return `${baseURL}${ENV.rootURL}submissions/${encodedId}`;
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
  _finishSubmission = task(async (submission: SubmissionModel, comment: string) => {
    const subEvent = await this.store.createRecord('submission-event');

    subEvent.performedBy = this.currentUser.user;
    subEvent.comment = comment;
    subEvent.performedDate = new Date();
    subEvent.submission = submission;
    subEvent.link = this._getSubmissionView(submission);

    // If the person clicking submit *is* the submitter, actually submit the submission.
    if (submission.submitter?.id === this.currentUser.user?.id) {
      submission.submitted = true;
      submission.submissionStatus = 'submitted';
      submission.submittedDate = new Date();

      const repos = submission.repositories;
      // Add agreements metadata
      const agreemd = this.schemaService.getAgreementsBlob(repos);

      if (agreemd) {
        const md = JSON.parse(submission.metadata);
        Object.assign(md, agreemd);
        submission.metadata = JSON.stringify(md);
      }

      subEvent.performerRole = 'submitter';
      subEvent.eventType = 'submitted';
    } else {
      // If they *aren't* the submitter, they're the preparer.
      submission.submissionStatus = 'approval-requested';
      subEvent.performerRole = 'preparer';

      // If a submitter is specified, it's a normal "approval-requested" scenario.
      if (submission.submitter?.id) {
        subEvent.eventType = 'approval-requested';
      } else if (submission.submitterName && submission.submitterEmail) {
        // If not specified but a name and email are prsent, create a mailto link.
        subEvent.eventType = 'approval-requested-newuser';
      }
    }

    // Save the updated submission, then save the submissionEvent
    await subEvent.save();
    await submission.save();
  });

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
  submit = task(async (submission: SubmissionModel, publication: PublicationModel, comment: string) => {
    const p = await publication.save();

    submission.submitted = false;
    submission.source = 'pass';
    submission.aggregatedDepositStatus = 'not-started';
    submission.publication = p;

    const s = await submission.save();
    await this._finishSubmission
      .perform(s, comment)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        throw e;
      });
  });

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
  approveSubmission(submission: SubmissionModel, comment: string) {
    // Add agreements metadata
    const agreemd = this.schemaService.getAgreementsBlob(submission.repositories);

    if (agreemd) {
      const md = JSON.parse(submission.metadata);
      Object.assign(md, agreemd);
      submission.metadata = JSON.stringify(md);
    }

    const se = this.store.createRecord('submission-event', {
      submission,
      performedBy: this.currentUser.user,
      performedDate: new Date(),
      comment,
      performerRole: 'submitter',
      eventType: 'submitted',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.submissionStatus = 'submitted';
      submission.submittedDate = new Date();
      submission.submitted = true;
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
  requestSubmissionChanges(submission: SubmissionModel, comment: string) {
    const se = this.store.createRecord('submission-event', {
      submission,
      comment,
      performedBy: submission.submitter,
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'changes-requested',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.submissionStatus = 'changes-requested';
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
  cancelSubmission(submission: SubmissionModel, comment: string) {
    const se = this.store.createRecord('submission-event', {
      submission,
      comment,
      performedBy: submission.submitter,
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'cancelled',
      link: this._getSubmissionView(submission),
    });

    return se.save().then(() => {
      submission.submissionStatus = 'cancelled';
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
  async deleteSubmission(submission: SubmissionModel) {
    if (submission.source !== 'pass' || submission.submissionStatus !== 'draft') {
      throw new Error(`Non-DRAFT submissions cannot be deleted`);
    }

    // Get submissions for this file
    const { content: filesDoc } = await this.store.request(query('file', fileForSubmissionQuery(submission.id)));
    const files = filesDoc.data;
    await Promise.all(files.map((file: FileModel) => file.destroyRecord()));

    const publication = submission.publication;

    // Search for Submissions that reference this publication
    submission.deleteRecord();
    await submission.save();

    const { content: subsDoc } = await this.store.request(
      query('submission', submissionsWithPublicationQuery(publication)),
    );
    if (subsDoc.data.length === 0) {
      publication.deleteRecord();
      await publication.save();
    }
  }

  /**
   * Sets the style of an exclamation mark indicating whether or not an adjacent link has been visisted.
   *
   * @param {*} visited whether or not the link has been visited
   */
  async setLinkVisited(visited: boolean) {
    document.querySelectorAll<HTMLElement>('.fa-exclamation-triangle').forEach((el) => {
      el.style.color = visited ? '#b0b0b0' : '#DC3545';
      el.style.fontSize = visited ? '2em' : '2.2em';
    });
  }
}
