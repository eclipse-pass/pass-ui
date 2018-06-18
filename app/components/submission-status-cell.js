import Component from '@ember/component';

export default Component.extend({
  store: Ember.inject.service(),
  repoCopies: null,

  init() {
    this._super(...arguments);
    // Query to get all 'repositoryCopy' objects that are associated with the 'publication'
    // in this record's 'submission'
    this.get('store').query('repositoryCopy', {
      size: 500,
      from: 0,
      query: {
        term: { publication: this.get('record.publication.id') }
      }
    }).then(rc => this.set('repoCopies', rc));
  },
  // For specs: https://github.com/OA-PASS/pass-ember/issues/568
  status: Ember.computed('record', 'repoCopies', function () {
    const submission = this.get('record');
    const repoCopies = this.get('repoCopies');

    if (!repoCopies) { // this will be NULL/UNDEFINED until search returns
      return '';
    }

    if (repoCopies.get('length') === 0) {
      const source = submission.get('source');
      if (source == 'pass' && submission.get('submitted')) {
        return 'Submitted';
      } else if (source == 'other' && !submission.get('submitted')) {
        return 'Manuscript expected';
      }
    }

    if (repoCopies.mapBy('copyStatus').every(status => status == 'complete')) {
      return 'Complete';
    }

    return 'See details';
  }),
});
