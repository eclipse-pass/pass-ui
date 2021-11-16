import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SubmissionsIndex extends Controller {
  @service currentUser;
  @service('app-static-config') configurator;

  @tracked assetsUri = null;
  @tracked themeInstance = Bootstrap4Theme.create();
  // Bound to message dialog.
  @tracked messageShow = false
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked tablePageSize = 50;
  @tracked tablePageSizeValues = [10, 25, 50];

  constructor() {
    super(...arguments);

    this.configurator.getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  }

  // Columns displayed depend on the user role
  get columns() {
    //TODO: Change currentUser.user.isAdmin
    if (get(this, 'currentUser.user.isSubmitter')) {
      return [
        {
          propertyName: 'publication',
          title: 'Article',
          className: 'title-column',
          component: 'submissions-article-cell'
        },
        {
          title: 'Award Number (Funder)',
          className: 'awardnum-funder-column',
          component: 'submissions-award-cell'
        },
        {
          propertyName: 'repositories',
          title: 'Repositories',
          className: 'repositories-column',
          component: 'submissions-repo-cell'
        },
        {
          propertyName: 'submittedDate',
          title: 'Submitted Date',
          className: 'date-column',
          component: 'date-cell'
        },
        {
          propertyName: 'submissionStatus',
          title: 'Status',
          className: 'status-column',
          component: 'submissions-status-cell'
        },
        {
          propertyName: 'submitterName',
          title: 'Submitter Name',
          className: 'name-column',
          component: 'submissions-name-cell'
        },
        {
          propertyName: 'submitterEmail',
          title: 'Submitter Email',
          className: 'email-column',
          component: 'submissions-email-cell'
        },
        {
          // propertyName: 'repoCopies',
          title: 'Manuscript IDs',
          className: 'msid-column',
          component: 'submissions-repoid-cell'
        }
      ];
    } else { // eslint-disable-line
      return [];
    }
  }
}
