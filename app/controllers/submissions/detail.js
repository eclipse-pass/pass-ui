import Controller from '@ember/controller';
// import swal from 'sweetalert2';

export default Controller.extend({
  metadataService: Ember.inject.service('metadata-blob'),
  tooltips: function() {
    $(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }.on('init'),
  store: Ember.inject.service('store'),
  externalSubmission: Ember.computed('metadataBlobNoKeys', function() {
    return this.get('metadataBlobNoKeys').Submission;
  }),
  /**
   * Ugly way to generate date for the template to use.
   * {
   *    'repository-id': {
   *      repo: { }, // repository obj
   *      deposit: {}, // related deposit, if exists
   *      repositoryCopy: {} // related repoCopy if exists
   *    }
   * }
   * This map is then turned into an array for use in the template
   */
  repoMap: Ember.computed('model.deposits', 'model.repoCopies', function() {
    let hasStuff = false;
    const repos = this.get('model.repos');
    const deps = this.get('model.deposits');
    const repoCopies = this.get('model.repoCopies');
    if (!repos) {
      return null;
    }
    let map = {};
    repos.forEach(
      r =>
        (map[r.get('id')] = {
          repo: r
        })
    ); // eslint-disable-line

    if (deps) {
      deps.forEach(deposit => {
        hasStuff = true;
        const repo = deposit.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            deposit
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], {
            deposit,
            repositoryCopy: deposit.get('repositoryCopy')
          });
        }
      });
    }
    if (repoCopies) {
      hasStuff = true;
      repoCopies.forEach(rc => {
        const repo = rc.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            repositoryCopy: rc
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], {
            repositoryCopy: rc
          });
        }
      });
    }
    if (hasStuff) {
      let results = [];
      Object.keys(map).forEach(k => results.push(map[k]));
      return results;
    }

    return null;
  }),
  metadataBlobNoKeys: Ember.computed('model.sub.metadata', function() {
    return this.get('metadataService').getDisplayBlob(
      this.get('model.sub.metadata')
    );
  }),
  isSubmitter: Ember.computed('currentUser.user', 'model', function() {
    return (
      this.get('model.sub.submitter.id') === this.get('currentUser.user.id')
    );
  }),
  isPreparer: Ember.computed('currentUser.user', 'model', function() {
    return (
      this.get('model.sub.preparer.id') === this.get('currentUser.user.id')
    );
  }),
  submissionNeedsPreparer: Ember.computed(
    'currentUser.user',
    'model',
    function() {
      return this.get('model.sub.submissionStatus') === 'changes-requested';
    }
  ),
  submissionNeedsSubmitter: Ember.computed(
    'currentUser.user',
    'model',
    function() {
      return (
        this.get('model.sub.submissionStatus') === 'approval-requested' ||
        this.get('model.sub.submissionStatus') === 'approval-requested-newuser'
      );
    }
  ),
  actions: {
    deleteComment(index) {
      console.log('delete', index);
      this.comments.removeAt(index);
    },
    requestMoreChanges() {
      if (!this.get('message')) {
        swal(
          'Comment field empty',
          'Please add a comment before requesting changes.',
          'warning'
        );
      }
      let se = this.get('store').createRecord('submissionEvent', {
        submission: this.get('model.sub.id'),
        performedBy: this.get('currentUser.user'),
        performedDate: new Date(),
        comment: this.get('message'),
        performerRole: 'submitter',
        eventType: 'changes-requested'
      });
      se.save().then(() => {
        let sub = this.get('model.sub');
        sub.set('submissionStatus', 'changes-requested');
        sub.save().then(() => {
          console.log('Requested more changes from preparer.');
        });
      });
    },
    approveChanges() {
      let se = this.get('store').createRecord('submissionEvent', {
        submission: this.get('model.sub.id'),
        performedBy: this.get('currentUser.user'),
        performedDate: new Date(),
        comment: this.get('message'),
        performerRole: 'submitter',
        eventType: 'submitted'
      });
      se.save().then(() => {
        let sub = this.get('model.sub');
        sub.set('submissionStatus', 'submitted');
        sub.save().then(() => {
          console.log('Approved changes and submitted submission.');
        });
      });
    },
    cancelSubmission() {
      let se = this.get('store').createRecord('submissionEvent', {
        submission: this.get('model.sub.id'),
        performedBy: this.get('currentUser.user'),
        performedDate: new Date(),
        comment: this.get('message'),
        performerRole: 'submitter',
        eventType: 'cancelled'
      });
      se.save().then(() => {
        let sub = this.get('model.sub');
        sub.set('submissionStatus', 'cancelled');
        sub.save().then(() => {
          console.log('Submission cancelled.');
        });
      });
    }
  }
});
