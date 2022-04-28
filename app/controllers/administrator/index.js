import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import {action} from '@ember/object';

export default class SubmissionsIndex extends Controller {
  @service currentUser;
  @service('app-static-config') configurator;

  actionData = null;
  @tracked assetsUri = null;
  @tracked themeInstance = Bootstrap4Theme.create();
  // Bound to message dialog.
  @tracked messageShow = false
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked tablePageSize = 10;
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
          component: 'submissions-article-cell',
          disableSorting: true,
          disableFiltering: true
        },
        {
          propertyName: 'awardNumber',
          title: 'Award Number',
          className: 'awardnum-funder-column',
          component: 'submissions-award-cell',
          disableSorting: true,
          disableFiltering: true
        },
        {
          propertyName: 'Funder',
          title: 'Funder',
          className: 'funder-column',
          component: 'submissions-funder-cell',
          disableSorting: true,
          disableFiltering: true
        },
        {
          propertyName: 'repositories',
          title: 'Repositories',
          className: 'repositories-column',
          component: 'submissions-repo-cell',
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
          component: 'submissions-status-cell',
          filterWithSelect: true
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
          propertyName: 'repoCopies',
          title: 'Manuscript IDs',
          className: 'msid-column',
          component: 'submissions-repoid-cell',
          disableSorting: true,
          disableFiltering: true
        }
      ];
    } else { // eslint-disable-line
      return [];
    }
  }

  @action 
  myAction(data) {
      let filteredColumn = this.getFilteredColumns(data);
      let sortedColumn = this.getSortedColumns(data);
 
      this.send('updateTable', {sortedColumn: sortedColumn, 
                                filteredColumn: filteredColumn})
  }

  getSortedColumns(data) {
    if (data.sort.length === 0) {
        return undefined;
    }
    let sort = data.sort[0].split(':')
    let propertyName = sort[0];
    let sortDirection = sort[1]; 

    let querySort = {};
    querySort[propertyName] = {
        missing: '_last',
        order: `${sortDirection}`
    }
    console.log(querySort)
    return [querySort];
  }

  getFilteredColumns(data) {
    if (Object.keys(data.columnFilters).length === 0) {
        return undefined;
    }
    let filterSort = [];
    for (let column in data.columnFilters) {
        let query = { 'term' : {}}
        if (column === "publication") {
        }
        query['term'][column] = data.columnFilters[column]
        filterSort.push(query)
    }
    return filterSort;
  }
  
}
