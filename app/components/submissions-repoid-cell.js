import { computed } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  repoCopies: null,
  jscholarshipCheckString: '/handle/',

  init() {
    this._super(...arguments);

    const publicationId = this.get('record.publication.id');
    if (!publicationId) {
      this.set('repoCopies', A());
      return;
    }
    this.get('store').query('repositoryCopy', {
      query: {
        term: { publication: publicationId }
      },
      from: 0,
      size: 100
    }).then(rc => this.set('repoCopies', rc));
  },
  didReceiveAttrs() {
    this._super(...arguments);
    if ($('#manuscriptIdTooltip').length == 0) {
      ($('.table-header:nth-child(6)')).append('<span id="manuscriptIdTooltip" tooltip-position="bottom" tooltip="ID are assigned to manuscript by target repositories."><i class="fas fa-info-circle d-inline"></i></span>');
    }
  },

  /**
   * Formatted:
   *  [
   *    {
   *      url: '',
   *      ids: [
   *        {
   *          title: 'href-worthy-id',
   *          display: 'somewhat-more-human-readable'
   *        }
   *      ]
   *    }
   *  ]
   */
  displayIds: computed('repoCopies', function () {
    const rc = this.get('repoCopies');
    if (!rc) {
      return [];
    }

    return rc.filter(repoCopy => !!repoCopy.get('externalIds')).map((repoCopy) => {
      const check = this.get('jscholarshipCheckString');

      // If an ID has the 'check' string, only display the sub-string after the 'check' string
      let ids = repoCopy.get('externalIds').map((id) => { // eslint-disable-line
        return {
          title: id,
          display: id.includes(check) ? id.slice(id.indexOf(check) + check.length) : id
        };
      });
      return {
        url: repoCopy.get('accessUrl'),
        ids
      };
      // Note the 'ids' notation in the above object gets translated to: ids: ids
    });
  })
});
