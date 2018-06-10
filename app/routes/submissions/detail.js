import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    const sub = this.get('store').findRecord('submission', params.submission_id);
    const files = this.get('store').query('file', { term: { submission: params.submission_id } });
    const deposits = this.get('store').query('deposit', { term: { submission: params.submission_id } });

    const repoCopies = sub.then(s =>
      this.get('store').query('RepositoryCopy', { term: { publication: s.get('publication.id') } }));

    return hash({
      sub,
      files,
      deposits,
      repoCopies
    });
  },
});
