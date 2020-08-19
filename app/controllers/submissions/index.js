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
    if (get(this, 'currentUser.user.isAdmin')) {
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
          // propertyName: 'repoCopies',
          title: 'Manuscript IDs',
          className: 'msid-column',
          component: 'submissions-repoid-cell'
        }
      ];
    } else if (get(this, 'currentUser.user.isSubmitter')) {
      return [
        {
          propertyName: 'publicationTitle',
          className: 'title-column',
          title: 'Article',
          component: 'submissions-article-cell'
        },
        {
          title: 'Award Number (Funder)',
          propertyName: 'grantInfo',
          className: 'awardnum-funder-column',
          component: 'submissions-award-cell',
          disableSorting: true
        },
        {
          propertyName: 'repositoryNames',
          title: 'Repositories',
          component: 'submissions-repo-cell',
          className: 'repositories-column',
          disableSorting: true
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
          propertyName: 'repoCopies',
          className: 'msid-column',
          title: 'Manuscript IDs',
          component: 'submissions-repoid-cell',
          disableSorting: true
        },
        {
          title: 'Actions',
          className: 'actions-column',
          component: 'submission-action-cell'
        }
      ];
    } else { // eslint-disable-line
      return [];
    }
  }
}
