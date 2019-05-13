import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';


/**
 * Service to manage submissions.
 */
export default Service.extend({
  store: Ember.inject.service('store'),
  currentUser: Ember.inject.service('current-user'),
  metadataService: Ember.inject.service('metadata-blob'),

  /**
   * _getSubmissionView - Internal method which returns the URL to view a submission.
   *
   * @param  {Submission} submission
   * @returns {string} URL to submission details page
   */
  _getSubmissionView(submission) {
    let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');

    return `${baseURL}${ENV.rootURL}submissions/${encodeURIComponent(`${submission.id}`)}`;
  },

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
  _finishSubmission(submission, comment) {
    let subEvent = this.get('store').createRecord('submissionEvent');

    subEvent.set('performedBy', this.get('currentUser.user'));
    subEvent.set('comment', comment);
    subEvent.set('performedDate', new Date());
    subEvent.set('submission', submission);
    subEvent.set('link', this._getSubmissionView(submission));

    // If the person clicking submit *is* the submitter, actually submit the submission.
    if (submission.get('submitter.id') === this.get('currentUser.user.id')) {
      submission.set('submitted', true);
      submission.set('submissionStatus', 'submitted');
      submission.set('submittedDate', new Date());

      // Add agreements metadata
      const agreemd = this.get('metadataService').getAgreementsBlob(submission.get('repositories'));

      if (agreemd) {
        let md = JSON.parse(submission.get('metadata'));
        this.get('metadataService').mergeBlobs(md, agreemd);
        submission.set('metadata', JSON.stringify(md));
      }

      submission.set(
        'repositories',
        submission.get('repositories').filter(repo => (repo.get('integrationType') !== 'web-link'))
      );

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
        // If not specified but a name and email are present, create a mailto link.
        subEvent.set('eventType', 'approval-requested-newuser');
      }
    }

    // Save the updated submission, then save the submissionEvent
    return subEvent.save().then(() => submission.save());
  },

  /**
   * _uploadFile - Internal method which adds a file to a submission in the
   *  repository. The bytes of the local file corresponding to the File object
   *  are read and uploaded to the Submission container. The modified File object
   *  is persisted.
   *
   * @param  {Submission} sub
   * @param  {File} file   Local file uploaded.
   * @returns {Promise}    Promise resolves to the File object.
   */
  _uploadFile(sub, file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = (evt) => {
        let data = evt.target.result;

        let xhr = new XMLHttpRequest();
        xhr.open('POST', `${sub.get('id')}`, true);
        xhr.setRequestHeader('Content-Disposition', `attachment; filename="${encodeURI(file.get('name'))}"`);
        let contentType = file.get('_file.type') ? file.get('_file.type') : 'application/octet-stream';
        xhr.setRequestHeader('Content-Type', contentType);

        // Hacks to handle different environments
        if (ENV.environment === 'travis' || ENV.environment === 'development') xhr.withCredentials = true;
        if (ENV.environment === 'development') xhr.setRequestHeader('Authorization', 'Basic YWRtaW46bW9v');

        xhr.onload = (results) => {
          file.set('submission', sub);
          file.set('uri', results.target.response);

          file.save().then((f) => {
            resolve(f);
          }).catch((error) => {
            console.log(error);
            reject(new Error(`Error creating file object: ${error.message}`));
          });
        };

        xhr.onerror = (error) => {
          console.log(error);
          reject(new Error(`Error uploading file: ${error.message}`));
        };

        xhr.send(data);
      };

      reader.onerror = (error) => {
        console.log(error);
        reject(new Error(`Error reading file: ${error.message}`));
      };

      reader.readAsArrayBuffer(file.get('_file'));
    });
  },

  /**
   * submit - Perform or prepares a submission. Persists the publication, associate
   *   the submission with the saved publication, modify the submission appropriately,
   *   uploads files, and finally persists the submission with an appropraite event
   *   to hold the comment. Repositories of type web-link are removed if submission
   *   is actually submitted.
   *
   * @param  {Submission} submission
   * @param  {Publication} publication Persisted and associated with Submission.
   * @param  {Files} files             Local files to upload and add to Submission.
   * @param  {String} comment          Comment added as to SubmissionEvent.
   * @returns {Promise}                Promise to perform the operation.
   */
  submit(submission, publication, files, comment) {
    return publication.save().then((p) => {
      submission.set('submitted', false);
      submission.set('source', 'pass');
      submission.set('aggregatedDepositStatus', 'not-started');
      submission.set('publication', p);

      return submission.save();
    }).then(s => Promise.all(files.map(f => this._uploadFile(s, f))).then(() => this._finishSubmission(s, comment)));
  },

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
<<<<<<< HEAD
    const extmd = this._getExternalSubmissionsMetadata(submission);

    // Add external submissions metadata
    if (extmd) {
      let md = JSON.parse(submission.get('metadata'));
      this.get('metadataService').mergeBlobs(md, extmd);
      submission.set('metadata', JSON.stringify(md));
    }

    // Add agreements metadata
    const agreemd = this.get('metadataService').getAgreementsBlob(submission.get('repositories'));

    if (agreemd) {
      let md = JSON.parse(submission.get('metadata'));
      this.get('metadataService').mergeBlobs(md, agreemd);
      submission.set('metadata', JSON.stringify(md));
    }

    // Remove external repositories
    submission.set(
      'repositories',
      submission.get('repositories').filter(repo => (repo.get('integrationType') !== 'web-link'))
    );

=======
>>>>>>> Remove 'external-submissions' from workflow
    let se = this.get('store').createRecord('submissionEvent', {
      submission,
      performedBy: this.get('currentUser.user'),
      performedDate: new Date(),
      comment,
      performerRole: 'submitter',
      eventType: 'submitted',
      link: this._getSubmissionView(submission)
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'submitted');
      submission.set('submittedDate', new Date());
      submission.set('submitted', true);
      return submission.save();
    });
  },

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
    let se = this.get('store').createRecord('submissionEvent', {
      submission,
      comment,
      performedBy: submission.get('submitter'),
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'changes-requested',
      link: this._getSubmissionView(submission)
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'changes-requested');
      return submission.save();
    });
  },

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
    let se = this.get('store').createRecord('submissionEvent', {
      submission,
      comment,
      performedBy: submission.get('submitter'),
      performedDate: new Date(),
      performerRole: 'submitter',
      eventType: 'cancelled',
      link: this._getSubmissionView(submission)
    });

    return se.save().then(() => {
      submission.set('submissionStatus', 'cancelled');
      return submission.save();
    });
  },

  /**
   * @param {string} submissionId
   * @returns {array} query result set of all files linked to the given submission ID
   */
  _getFiles(submissionId) {
    return this.get('store').query('file', {
      term: { submission: submissionId }
    });
  },

  /**
   * Delete a draft submission object and it's associated Publication object,
   * if applicable. Persist all changes.
   *
   * @param {Submission} submission submission to delete
   * @returns {Promise} that returns once the submission deletion is persisted
   */
  async deleteSubmission(submission) {
    const result = [];

    const pub = submission.get('publication');
    if (pub && pub.hasOwnProperty('destroyRecord')) {
      result.push(pub.destroyRecord());
    }

    // eslint-disable-next-line function-paren-newline
    result.push(
      this._getFiles(submission.get('id')).then(files => files.map(file => file.destroyRecord()))
    ); // eslint-disable-line function-paren-newline

    result.push(submission.destroyRecord());
    return Promise.all(result);
  }
});
