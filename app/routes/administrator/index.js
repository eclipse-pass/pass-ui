import { inject as service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
import { get } from '@ember/object';
import {action} from '@ember/object';
import PublicationModel from '../../models/publication';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;

  @service('search-helper')
  searchHelper;

  defaultAdminSort = [{
    submittedDate: {
        missing: '_last',
        order: 'desc'
    }
  }];

  defaultSubmitterSort = [
    { submitted: { missing: '_last', order: 'asc' } },
    { submittedDate: { missing: '_last', order: 'desc' } },
    { submissionStatus: { missing: '_last', order: 'asc' } }
  ];

  sort = undefined;
  filter = undefined;


  async model() {
    const user = get(this, 'currentUser.user');

    let submissions = null;

    //Method 1 of updating model
    if (user.get('isAdmin')) {
      submissions = this._doAdmin(this.sort, this.filter);
    } else if (user.get('isSubmitter')) {
      submissions = this._doSubmitter(user, this.sort, this.filter);
    }

    /* Default model - Method 2
    if (user.get('isAdmin')) {
        submissions = this._doAdmin();
    } else if (user.get('isSubmitter')) {
        submissions = this._doSubmitter(user);
    } */

    submissions.then(() => this.searchHelper.clearIgnore());

    return RSVP.hash({
      submissions
    });
  }



  _doAdmin(sortedColumn = this.defaultAdminSort, filteredColumn = []) {
    const ignoreList = this.searchHelper.getIgnoreList();

    const query = {
      sort: sortedColumn,
      query: {
        match_all: {},
        filter: filteredColumn,
        must_not: [
          { term: { submissionStatus: 'cancelled' } }
        ]
      },
      size: 500
    };

    if (ignoreList && ignoreList.length > 0) {
      query.query.must_not.push({ terms: { '@id': ignoreList } });
    }

    return this.store.query('submission', query);
  }

  _doSubmitter(user, sortedColumn = this.defaultSubmitterSort, filteredColumn = []) {
    const ignoreList = this.searchHelper.getIgnoreList();
    const query = {
      sort: sortedColumn,
      query: {
        bool: {
          should: [
            { term: { submitter: user.get('id') } },
            { term: { preparers: user.get('id') } },
          ],
          must_not: [
            { term: { submissionStatus: 'cancelled' } }
          ]
          
        },
      },
      size: 500
    };
    if (ignoreList && ignoreList.length > 0) {
      query.query.bool.must_not.push({ terms: { '@id': ignoreList } });
    }

    console.log("tets")
    return this.store.query('submission', query);
  }

  @action
  async updateTable({sortedColumn, filteredColumn}) {
    const user = get(this, 'currentUser.user');

    //Method 1 of updating model
    //Update fields then call model()
    this.sort = sortedColumn;
    this.filter = filteredColumn;
    this.model();
    
    /* Method 2 of updating model
    let submissions = null;
    
    if (user.get('isAdmin')) {
      submissions = this._doAdmin(sortedColumn, filteredColumn);
    } else if (user.get('isSubmitter')) {
      submissions = this._doSubmitter(user, sortedColumn, filteredColumn);
    }

    submissions.then(() => this.searchHelper.clearIgnore());

    return RSVP.hash({
      submissions
    });
    */
  }
}
