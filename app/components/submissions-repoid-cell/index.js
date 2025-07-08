/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SubmissionsRepoidCell extends Component {
  @service store;

  @tracked repoCopies = null;

  @action
  async setUpRepoidCell() {
    const publication = await this.args.record.publication;
    if (!publication?.id) {
      if (!(get(this, 'isDestroyed') || get(this, 'isDestroying'))) {
        this.repoCopies = [];
        return;
      }
    }

    const query = {
      filter: {
        repositoryCopy: `publication.id==${publication.id}`,
      },
    };

    this.store.query('repositoryCopy', query).then((rc) => {
      if (!(get(this, 'isDestroyed') || get(this, 'isDestroying'))) {
        set(this, 'repoCopies', rc);
      }
    });
  }

  setToolTip() {
    if (!document.querySelector('#manuscriptIdTooltip')) {
      let th = document.querySelector('.table-header:nth-child(6)');
      let span = document.createElement('span');
      let icon = document.createElement('i');

      span.id = 'manuscriptIdTooltip';
      span.setAttribute('tooltip-position', 'bottom');
      span.setAttribute('tooltip', 'IDs are assigned to manuscripts by target repositories.');
      icon.classList.add('fas', 'fa-info-circle', 'd-inline');

      span.appendChild(icon);
      th.appendChild(span);
    }
  }

  /**
   * Format a repository ID for display.
   * If the ID includes one of the markers, return the ID after the marker
   * This deals with DSpace handle and item URLs.
   */
  formatId(id) {
    const markers = ['/handle/', '/items/'];

    for (let marker of markers) {
      let index = id.indexOf(marker);
      if (index !== -1) {
        return id.slice(index + marker.length);
      }
    }

    return id;
  }

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
  get displayIds() {
    const rc = this.repoCopies;
    if (!rc) {
      return [];
    }

    return rc
      .filter((repoCopy) => !!repoCopy.externalIds)
      .map((repoCopy) => {
        let ids = repoCopy.externalIds.map((id) => {
          return {
            title: id,
            display: this.formatId(id),
          };
        });
        return {
          url: repoCopy.accessUrl,
          ids,
        };
        // Note the 'ids' notation in the above object gets translated to: ids: ids
      });
  }
}
