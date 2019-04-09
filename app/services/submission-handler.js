import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  store: Ember.inject.service('store'),
  currentUser: Ember.inject.service('current-user'),
  metadataService: Ember.inject.service('metadata-blob'),

  /**
  * Internal method which returns the URL to view a submission.
  *
  */
  _getSubmissionView(submission) {
    let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');

    return `${baseURL}${ENV.rootURL}submissions/${encodeURIComponent(`${submission.id}`)}`;
  },

  /**
  * Internal method to finish a submission which has had all its files uploaded.
  * Adds a submitted event with the given comment.
  * Returns a promise which resolves to the updated submission.
  */
  _finishSubmission(submission, comment) {
    let subEvent = this.store.createRecord('submissionEvent');

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
  * Internal method which adds a file to a submission.
  * The bytes of the local file corresponding to the File object are read and
  * uploaded to the Submission container. The modified File object is updated.
  * Returns a promise which resolves to the File object.
  */
  _uploadFile(sub, file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

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

      reader.onerror = (event) => {
        console.log(error);
        reject(new Error(`Error reading file: ${error.message}`));
      };

      reader.readAsArrayBuffer(file.get('_file'));
    });
  },

  /**
  * Perform a submission.
  * Persists the publication, associate the submission with the saved publication,
  * modify the submission appropriately, uploads files, and finally persists the submission
  * with an appropraite event to hold the comment.

  * Return a promise that does these things. See _uploadFile for how various errors may
  * be reported.
  */
  submit(submission, publication, files, comment) {
    return publication.save().then((p) => {
      submission.set('submitted', false);
      submission.set('source', 'pass');
      submission.set('aggregatedDepositStatus', 'not-started');
      submission.set('publication', p);

      return submission.save();
    }).then(s => Promise.all(files.map(f => this._uploadFile(f))).then(() => this._finishSubmission(s, comment)));
  },

  /**
  * If the submission is submitted, return external-submissions object from metadata.
  * Otherwise generate what it should be from external repositories.
  */
  _getExternalSubmissionsMetadata(submission) {
    if (submission.get('submitted')) {
      const metadata = JSON.parse(submission.get('metadata'));
      let values = Ember.A();

      // TODO Hack for old style metadata blob. Should remove later.
      if (Array.isArray(metadata)) {
        values = metadata.filter(x => x.id === 'external-submissions');

        if (values.length == 0) {
          return null;
        }

        return values[0];
      }

      return metadata;
    }

    return this.get('metadataService').getExternalReposBlob(submission.get('repositories'));
  },

  // Submitter approves submission.
  // Metadata is added to external-submissions for all web-link repos and those
  // repos are removed.
  // Attaches a SubmissionEvent of type submitted with the given comment and
  // sets the status of the Submission to changes-requested.
  // Returns a promise that makes those changes.
  approveSubmission(submission, comment) {
    const extmd = _getExternalSubmissionsMetadata(submission);

    // Add external submissions metadata
    if (extmd) {
      let md = JSON.parse(submission.get('metadata'));
      this.get('metadataService').mergeBlobs(md, extmd);
      submission.set('metadata', JSON.stringify(md));
    }

    // Remove external repositories
    submission.set(
      'repositories',
      submission.get('repositories').filter(repo => (repo.get('integrationType') !== 'web-link'))
    );

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
  * Request that submission be changed before approval on behalf of submitter.
  * Attaches a SubmissionEvent of type changes-requested with the given comment and
  * sets the status of the Submission to changes-requested.
  * Returns a promise that makes those changes.
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
  * Cancel a prepared submission on behalf of submitter.
  * Attaches a SubmissionEvent of type cancelled with the given comment and
  * sets the status of the Submission to cancelled.
  * Returns a promise that makes those changes.
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
  }
});
