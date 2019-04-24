import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  workflow: service('workflow'),
  submission: alias('model.newSubmission'),
  repositories: alias('model.repositories'),
  publication: alias('model.publication'),
  submissionEvents: alias('model.submissionEvents'),
  parent: Ember.inject.controller('submissions.new'),

  // TODO: Might need this if calling store.findRecord doesn't work right in the Route
  // /**
  //  * Required repositories
  //  */
  // requiredRepos: Ember.computed('repoRules', function () {
  //   const rules = this.get('repoRules');
  // }),

  // /**
  //  * Completely optional repositories
  //  */
  // optionalRepos: Ember.computed('repoRules', function () {
  //   const rules = this.get('repoRules');
  // }),

  // /**
  //  * Repository choices. Array of arrays of repositories
  //  * This array contains arrays that represent choice groups. A user can select
  //  * one or more from within a group, but must select at least one from each
  //  * group.
  //  */
  // choiceRepos: Ember.computed('repoRules', function () {
  //   const rules = this.get('repoRules');
  // }),

  nextTabIsActive: Ember.computed('workflow.maxStep', function () {
    return (this.get('workflow').getMaxStep() > 4);
  }),
  loadingNext: false,
  needValidation: Ember.computed('nextTabIsActive', 'loadingNext', function () {
    return (this.get('nextTabIsActive') || this.get('loadingNext'));
  }),
  actions: {
    loadNext() {
      this.set('loadingNext', true);
      this.send('validateAndLoadTab', 'submissions.new.metadata');
    },
    loadPrevious() {
      this.send('loadTab', 'submissions.new.policies');
    },
    loadTab(gotoRoute) {
      // this.send('updateRelatedData'); // I think this is only relevant for old style metadata blob
      this.get('submission').save().then(() => {
        this.transitionToRoute(gotoRoute);
        this.set('loadingNext', false); // reset for next time
      });
    },
    validateAndLoadTab(gotoRoute) {
      let needValidation = this.get('needValidation');
      if (needValidation && this.get('submission.repositories.length') == 0) {
        swal({
          type: 'warning',
          title: 'No repositories selected',
          html: 'If you don\'t pan on submitting to any repositories, you can stop at this time. Click "Exit '
                + 'submission" to return to the dashboard, or "Continue submission" to go back and select a repository',
          showCancelButton: true,
          cancelButtonText: 'Exit Submission',
          confirmButtonText: 'Continue submission'
        }).then((value) => {
          if (value.dismiss) {
            this.transitionToRoute('dashboard');
          }
        });
        // do nothing
      } else {
        this.send('loadTab', gotoRoute);
      }
    },
    // updateRelatedData() {
    //   // Remove any schemas not associated with the repositories attached to the submission or not on the whitelist.
    //   // Whitelisted schemas are not associated with repositories but still required by deposit services.
    //   let metadata;
    //   if (this.get('submission.metadata')) {
    //     metadata = JSON.parse(this.get('submission.metadata'));
    //   } else {
    //     metadata = [];
    //   }
    //   let schemaWhitelist = ['common', 'crossref', 'agent_information', 'pmc'];
    //   let schemaIds = this.get('submission.repositories').map(x => JSON.parse(x.get('formSchema')).id);
    //   metadata = metadata.filter(md => schemaIds.includes(md.id) || schemaWhitelist.includes(md.id));
    //   this.set('submission.metadata', JSON.stringify(metadata));
    // }
    abort() {
      this.get('parent').send('abort');
    }
  }
});
