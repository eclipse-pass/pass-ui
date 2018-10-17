import Controller from '@ember/controller';
// import swal from 'sweetalert2';

export default Controller.extend({
  metadataService: Ember.inject.service('metadata-blob'),
  tooltips: function () {
    $(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }.on('init'),
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  externalSubmission: Ember.computed('metadataBlobNoKeys', function () {
    return this.get('metadataBlobNoKeys').Submission;
  }),
  hasProxy: Ember.computed(
    'model.sub.preparers',
    function () {
      return this.get('model.sub.preparers.length') > 0;
    }
  ),
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
  repoMap: Ember.computed('model.deposits', 'model.repoCopies', function () {
    let hasStuff = false;
    const repos = this.get('model.repos');
    const deps = this.get('model.deposits');
    const repoCopies = this.get('model.repoCopies');
    if (!repos) {
      return null;
    }
    let map = {};
    repos.forEach((r) => {
      (map[r.get('id')] = {
        repo: r
      });
    });

    if (deps) {
      deps.forEach((deposit) => {
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
      repoCopies.forEach((rc) => {
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
  metadataBlobNoKeys: Ember.computed('model.sub.metadata', function () {
    return this.get('metadataService').getDisplayBlob(this.get('model.sub.metadata'));
  }),
  isSubmitter: Ember.computed('currentUser.user', 'model', function () {
    return (
      this.get('model.sub.submitter.id') === this.get('currentUser.user.id')
    );
  }),
  isPreparer: Ember.computed('currentUser.user', 'model', function () {
    return this.get('model.sub.preparers')
      .map(x => x.get('id'))
      .contains(this.get('currentUser.user.id'));
  }),
  submissionNeedsPreparer: Ember.computed(
    'currentUser.user',
    'model',
    function () {
      return this.get('model.sub.submissionStatus') === 'changes-requested';
    }
  ),
  submissionNeedsSubmitter: Ember.computed(
    'currentUser.user',
    'model',
    function () {
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
        submission: this.get('model.sub'),
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
          window.location.reload(true);
        });
      });
    },
    approveChanges() {
      // this.get('model.repos').forEach((repo) => {
      // console.log(repo.get('agreementText'));

      let reposWithAgreementText = _this2.get('model.repos').filter((repo) => {
        if (repo.get('agreementText')) {
          return repo;
        }
      });
      debugger;
      console.log(reposWithAgreementText);
      // YOU have the agreement text now, figoure out how to get it in to the swal

      swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3']
      }).queue([
        {
          title: 'Question 1',
          text: 'Chaining swal2 modals is easy'
        },
        'Question 2',
        'Question 3'
      ]).then((result) => {
        if (result.value) {
          swal({
            title: 'All done!',
            html: 'Your answers: <pre><code>' +
              JSON.stringify(result.value) +
              '</code></pre>',
            confirmButtonText: 'Lovely!'
          });
        }
        // });

        // swal({
        //   title: 'Deposit Agreement',
        //   html: `<pre>${repo.get('agreementText')}</pre>`,
        //   type: 'info',
        //   showCancelButton: true,
        //   confirmButtonColor: '#3085d6',
        //   cancelButtonColor: '#d33',
        //   confirmButtonText: 'I agree to this text on today\'s date',
        //   cancelButtonText: 'Never mind'
        // }).then((result) => {
        //   console.log(result.value);
        //   debugger;
        //   if (result.value) {
        //     let se = this.get('store').createRecord('submissionEvent', {
        //       submission: this.get('model.sub'),
        //       performedBy: this.get('currentUser.user'),
        //       performedDate: new Date(),
        //       comment: this.get('message'),
        //       performerRole: 'submitter',
        //       eventType: 'submitted'
        //     });
        //     se.save().then(() => {
        //       let sub = this.get('model.sub');
        //       sub.set('submissionStatus', 'submitted');
        //       sub.set('submitted', true);
        //       sub.save().then(() => {
        //         window.location.reload(true);
        //       });
        //     });
        //   }
        // });
      });
    },
    cancelSubmission() {
      let se = this.get('store').createRecord('submissionEvent', {
        submission: this.get('model.sub'),
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
          window.location.reload(true);
        });
      });
    }
  }
});
