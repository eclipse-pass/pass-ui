import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    const subId = params.submission_id;
    const sub = this.get('store').findRecord('submission', subId);
    const deposits = this.get('store').query('deposit', { term: { submission: subId } });

    return RSVP.hash({
      submission: sub,
      deposits
    });
  },
});
