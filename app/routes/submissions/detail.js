import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    const sub = this.get('store').findRecord('submission', params.submission_id);
    return hash({
      sub,
      files: this.get('store').findAll('file')
    });
  },
});
