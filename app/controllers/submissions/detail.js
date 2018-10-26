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
    requestMoreChanges() {
      if (!this.get('message')) {
        swal(
          'Comment field empty',
          'Please add a comment before requesting changes.',
          'warning'
        );
      } else {
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
      }
    },
    async approveChanges() {
      let reposWithAgreementText = this.get('model.repos').map((repo) => {
        if (repo.get('agreementText')) {
          return {
            id: repo.get('name'),
            title: `Deposit requirements for ${repo.get('name')}`,
            html: `<textarea rows="16" cols="40" name="embargo" class="alpaca-control form-control disabled" disabled="" autocomplete="off">${repo.get('agreementText')}</textarea>`
          };
        }
      });
      // INFO: this is used to testing more then 1 repo.
      // reposWithAgreementText.push({
      //   id: 'some',
      //   title: `Deposit requirements for `,
      //   html: `<textarea rows="16" cols="40" name="embargo" class="alpaca-control form-control disabled" disabled="" autocomplete="off"></textarea>`
      // });
      const result = await swal.mixin({
        input: 'checkbox',
        inputPlaceholder: 'I agree to the above statement on today\'s date ',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: reposWithAgreementText.map((repo, index) => index + 1),
      }).queue(reposWithAgreementText);
      if (result.value) {
        let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
          // if the user agreed to depost to this repo === 1
          if (result.value[index] === 1) {
            return repo;
          }
        });
        // make sure there are repos to submit to.
        if (reposThatUserAgreedToDeposit.length > 0 && this.get('model.sub.repositories.length') > 0) {
          swal({
            title: 'You agree to deposit to the following repositories',
            html: `Your repositories: <pre><code> ${JSON.stringify(reposThatUserAgreedToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')} </code></pre>`, // eslint-disable-line
            confirmButtonText: 'Submit',
            showCancelButton: true,
          }).then((result) => {
            console.log(result.value);
            if (result.value) {
              // Update repos to reflect repos that user agreed to deposit
              this.set('model.sub.repositories', this.get('model.sub.repositories').filter((repo) => {
                let temp = reposWithAgreementText.map(x => x.id).includes(repo.get('name'));
                if (!temp) {
                  return true;
                } else if (reposThatUserAgreedToDeposit.map(r => r.id).includes(repo.get('name'))) {
                  return true;
                }
                return false;
              }));
              // update Metadata blob to refelect changes in repos
              this.set('model.sub.metadata', JSON.stringify(JSON.parse(this.get('model.sub.metadata')).filter((md) => {
                let whiteListedMetadataKeys = ['common', 'crossref', 'pmc', 'agent_information'];
                if (whiteListedMetadataKeys.includes(md.id)) {
                  return md;
                }
                return this.get('model.sub.repositories').map(r => r.get('name')).includes(md.id);
              })));
              $('.block-user-input').css('display', 'block');
              // save sub and send it
              let se = this.get('store').createRecord('submissionEvent', {
                submission: this.get('model.sub'),
                performedBy: this.get('currentUser.user'),
                performedDate: new Date(),
                comment: this.get('message'),
                performerRole: 'submitter',
                eventType: 'submitted'
              });
              se.save().then(() => {
                let sub = this.get('model.sub');
                sub.set('submissionStatus', 'submitted');
                sub.set('submitted', true);
                sub.save().then(() => {
                  window.location.reload(true);
                });
              });
            }
          });
        } else {
          let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo) => {
            if (!reposThatUserAgreedToDeposit.includes(repo)) {
              return true;
            }
          });
          swal({
            title: 'Your submission cannot be submitted.',
            html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(reposUserDidNotAgreeToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted. \n You can either (a) cancel the submission or (b) return to the submission to provide required input and try again.`,
            confirmButtonText: 'Cancel submission',
            showCancelButton: true,
            cancelButtonText: 'Go back to edit information'
          }).then((result) => {
            console.log(result.value);
            if (result.value) {
              this.send('cancelSubmission');
            }
          });
        }
      }
    },
    cancelSubmission() {
      if (!this.get('message')) {
        swal(
          'Comment field empty',
          'Please add a comment for your cancellation.',
          'warning'
        );
        return;
      }
      swal({
        title: 'Are you sure?',
        text: 'If you cancel this submission, it will not be able to be resumed.',
        confirmButtonText: 'Yes, cancel this submission',
        confirmButtonColor: '#f86c6b',
        cancelButtonText: 'Never mind',
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
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
      });
    }
  }
});
