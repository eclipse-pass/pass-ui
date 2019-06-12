import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  currentUser: service('current-user'),
  searchHelper: service('search-helper'),

  async model() {
    const user = this.get('currentUser.user');

    let submissions = null;

    if (user.get('isAdmin')) {
      submissions = this._doAdmin();
    } else if (user.get('isSubmitter')) {
      submissions = this._doSubmitter(user);
    }

    submissions.then(() => this.get('searchHelper').clearIgnore());

    return RSVP.hash({
      submissions
    });
  },

  _doAdmin() {
    const ignoreList = this.get('searchHelper').getIgnoreList();

    const query = {
      sort: [{
        submittedDate: {
          missing: '_last',
          order: 'desc'
        }
      }],
      query: {
        match_all: {},
        must_not: {
          term: { submissionStatus: 'cancelled' }
        }
      },
      size: 500
    };

    if (ignoreList && ignoreList.length > 0) {
      query.query.bool.must_not.push({ terms: { '@id': ignoreList } });
    }

    return this.store.query('submission', query);
  },

  _doSubmitter(user) {
    const ignoreList = this.get('searchHelper').getIgnoreList();

    const query = {
      sort: [
        { submitted: { missing: '_last', order: 'asc' } },
        { submittedDate: { missing: '_last', order: 'desc' } },
        { submissionStatus: { missing: '_last', order: 'asc' } }
      ],
      query: {
        bool: {
          should: [
            { term: { submitter: user.get('id') } },
            { term: { preparers: user.get('id') } },
          ],
          must_not: [
            { term: { submissionStatus: 'cancelled' } }
          ]
        }
      },
      size: 500
    };

    if (ignoreList && ignoreList.length > 0) {
      query.query.bool.must_not.push({ terms: { '@id': ignoreList } });
    }

    return this.store.query('submission', query);
  },
});
