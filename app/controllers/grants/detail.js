import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({

  store: service('store'),

  /* For providing access to a newly created submission object */
  newSubmissionObject: null,

  actions: {

    /** Create a new submission object */
    newSubmission() {
      this.set('newSubmissionObject', this.get('store').createRecord('submission'));
    },

    /** Link to the contextual grant, and save the submission
     *
     * @returns {Promise} Save promise
     */
    saveAndLinkGrant() {
      const submission = this.get('newSubmissionObject');
      this.set('newSubmissionObject', null);
      const grant = this.model;

      return submission.save().then(() => {
        submission.get('grants').pushObject(grant);
        return submission.save();
      }).then(() => {
        grant.get('submissions').pushObject(submission);
        return grant.save();
      });
    },
  },

  columns: [
    { propertyName: 'publication', title: 'Article', component: 'submissions-article-cell' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'user.username', title: 'Corr. Author' },
    { propertyName: 'deposits', title: 'Repo', component: 'submissions-repo-cell'},
    { propertyName: 'dateSubmitted', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'dateSubmitted', title: 'Submitted Date', component: 'date-cell' },
    {
      propertyName: 'status',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete'],
    },
    {  propertyName: 'deposits', title: 'OAP Repo Id', component: 'submissions-repoid-cell' },
  ],

  themeInstance: Bootstrap4Theme.create(),
});
