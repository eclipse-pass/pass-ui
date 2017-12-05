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
      this.set('messageTo', submission.get('author.name'));
      this.set('messageSubject', `Article submission: ${submission.get('title')}`)
      this.set('messageText', '');
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
    { propertyName: 'author.name', title: 'Corr. Author', component: 'submissions-author-cell' },
    { title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'updatedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    { propertyName: 'status', title: 'Status' },
    { title: 'OAP Repo Id', component: 'submissions-repoid-cell' }
  ],

  adminColumns: [
    { propertyName: 'title', title: 'Article' },
    { title: 'Award Number (Funder)', component: 'submissions-award-cell' },
    { propertyName: 'author.name', title: 'Corr. Author'},
    { title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'updatedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    { propertyName: 'status', title: 'Status' },
    { title: 'OAP Repo Id', component: 'submissions-repoid-cell' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
