import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import RSVP from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    // TODO: change returned records based on role
    let submissions = this.store.findAll('submission', {
      include: 'publication',
    });
    let publications = this.store.findAll('publication');
    let repositories = this.store.findAll('repository');
    let grants = this.store.findAll('grant');
    let funders = this.store.findAll('funder');
    return RSVP.hash({
      submissions,
      publications,
      repositories,
      grants,
      funders
    });
  },
});
