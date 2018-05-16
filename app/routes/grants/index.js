import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { hash, defer } from 'rsvp';

const { service } = Ember.inject;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service('current-user'),

  model() {
    const user = this.get('currentUser.user');
    if (!user) {
      console.log(' ## No user MOO');
      return;
    }

    let promise = defer();
    const grantQuery = {
      // sort: [{ awardNumber: { order: 'asc' } }], // TODO
      query: {
        bool: {
          should: [
            { term: { pi: user.get('id') } },
            // { term: { coPis: user.get('id') } }
          ]
        }
      }
    };

    // First search for all Grants associated with the current user
    this.get('store').query('grant', grantQuery).then((grants) => {
      let results = [];
      let submissionQuery = { bool: { should: [] } };
      grants.forEach((grant) => {
        submissionQuery.bool.should.push({ match: { grants: grant.get('id') } });
        results.push({
          grant,
          submissions: Ember.A()
        });
      });

      // Then search for all Submissions associated with the returned Grants
      this.get('store').query('submission', submissionQuery).then((subs) => {
        subs.forEach((submission) => {
          submission.get('grants').forEach((grant) => {
            let match = results.find(res => res.grant.get('id') === grant.get('id'));
            if (match) {
              match.submissions.pushObject(submission);
            }
          });
        });

        promise.resolve(results);
      });
    });

    return promise.promise;
  },
});
