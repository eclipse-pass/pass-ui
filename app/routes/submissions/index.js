import CheckSessionRoute from '../check-session-route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  currentUser: service('current-user'),

  model() {
    const user = this.get('currentUser.user');

    let submissions = null;

    if (user.get('isAdmin')) {
      submissions = this._doAdmin();
    } else if (user.get('isSubmitter')) {
      submissions = this._doSubmitter(user);
    }

    return RSVP.hash({
      submissions
    });
  },

  _doAdmin() {
    return this.store.query('submission', {
      sort: [{
        submittedDate: {
          missing: '_last',
          order: 'desc'
        }
      }],
      query: {
        match_all: {}
      },
      size: 500
    });
  },

  _doSubmitter(user) {
    return this.store.query('submission', {
      sort: [
        { submitted: { missing: '_last', order: 'asc' } },
        { submittedDate: { missing: '_last', order: 'desc' } },
        { submissionStatus: { missing: '_last', order: 'asc' } }
      ],
      query: {
        bool: {
          should: [
            {
              term: {
                submitter: user.get('id')

              }
            },
            {
              term: {
                preparers: user.get('id')
              }
            },
          ]
        }
      },
      size: 500
    });
  },
});
