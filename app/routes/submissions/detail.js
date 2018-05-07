import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('submission', params.submission_id);
  },
});
