import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { hash } from 'rsvp';

const { service } = Ember.inject;

export default Route.extend(AuthenticatedRouteMixin, {

  model() {
    let submissions = this.get('store').findAll('submission');
    let publications = this.get('store').findAll('publication');
    let grants = this.get('store').findAll('grant');

    return hash({
      submissions,
      publications,
      grants
    });
  },
});
