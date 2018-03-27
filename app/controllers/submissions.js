import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { computed } from '@ember/object';

export default Controller.extend({
    // Bound to message dialog.
  messageShow: false,
  messageTo: '',
  messageSubject: '',
  messageText: '',

  actions: {
    authorclick(submission) {
      this.set('messageShow', true);
      this.set('messageTo', submission.get('author.displayName'));
      this.set('messageSubject', 'OAP Compliance')
      this.set('messageText', `Concerning submission ${submission.get('title')}, the status is ${submission.get('status')}.\nPlease check your PASS dashboard.`);
    }
  },

  // Columns displayed depend on the user role
  columns: computed('session.user', {
    get() {
      if (this.get('session.isAdmin')) {
            return this.get('adminColumns');
      } else if (this.get('session.isPI')) {
            return this.get('piColumns');
      } else {
        return [];
      }
    }
  }),

  piColumns: [
    { propertyName: 'title', title: 'Article' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'author.displayName', title: 'Corr. Author', component: 'submissions-author-cell' },
    { title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'updatedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    { propertyName: 'status', title: 'Status', filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete']},
    { title: 'OAP Repo Id', component: 'submissions-repoid-cell' }
  ],

  adminColumns: [
    { propertyName: 'title', title: 'Article' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'author.displayName', title: 'Corr. Author'},
    { title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'updatedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    { propertyName: 'status', title: 'Status', filterWithSelect: true,
      predefinedFilterOptions: ['In Progress', 'Complete']},
    { title: 'OAP Repo Id', component: 'submissions-repoid-cell' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
