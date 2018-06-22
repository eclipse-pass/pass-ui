import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  currentUser: Ember.inject.service('current-user'),

  model() {
    const user = this.get('currentUser.user');

    let submissions = null;

    // Submission id to array of repoCopy
    let repoCopiesMap = {};

    // Submission id to array of deposit
    let depositsMap = {};

    if (user.get('isAdmin')) {
      submissions = this._doAdmin();
    } else if (user.get('isSubmitter')) {
      submissions = this._doSubmitter(user);
    }

    if (submissions) {
      depositsMap = submissions.then(result => {
        return this.get('store').query('deposit', {
          from: 0,
          size: 500,
          query: {
            terms : { submission : result.map(s => s.get('id')) }
          }
        });
      }).then(deposits => {
        let map = {};

        submissions.forEach(s => {
          map[s.get('id')] = [];
        });

        deposits.forEach(d => {
          map[d.get('submission.id')].push(d);
        });

        return map;
      });

      repoCopiesMap = submissions.then(result => {
        return this.get('store').query('repositoryCopy', {
          from: 0,
          size: 500,
          query: {
            terms: { publication: result.map(s => s.get('publication.id')) }
          }
        });
      }).then(repoCopies => {
        let map = {};

        submissions.forEach(s => {
          map[s.get('id')] = [];
        });

        repoCopies.forEach(rc => {
          let sub = submissions.find(s => s.get('publication.id') == rc.get('publication.id'));

          if (sub) {
            map[sub.get('id')].push(rc);
          }
        });

        return map;
      });
    }

    return RSVP.hash({
      submissions,
      repoCopiesMap,
      depositsMap
    });
  },

  _doAdmin() {
    return this.store.query('submission', {
      sort: [
        { submittedDate: { missing: '_last', order: 'desc' } }
      ],
      query: { match_all: {} },
      size: 500
    });
  },

  _doSubmitter(user) {
    return this.store.query('submission', {
      sort: [
        { submittedDate: { missing: '_last', order: 'desc' } }
      ],
      query: { match: { user: user.get('id') } },
      size: 500
    });
  },
});
