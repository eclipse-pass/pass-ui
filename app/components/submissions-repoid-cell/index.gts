import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';

export default class SubmissionsRepoidCell extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked repoCopies: any[] | null = null;

  @action
  async setUpRepoidCell() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publication = await (this.args as any).record.publication;
    if (!publication?.id) {
      if (!(this.isDestroyed || this.isDestroying)) {
        this.repoCopies = [];
        return;
      }
    }

    const query = {
      filter: {
        repositoryCopy: `publication.id==${publication.id}`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.store.query('repository-copy', query).then((rc: any) => {
      if (!(this.isDestroyed || this.isDestroying)) {
        this.repoCopies = rc;
      }
    });
  }

  @action
  setToolTip() {
    if (!document.querySelector('#manuscriptIdTooltip')) {
      const th = document.querySelector('.table-header:nth-child(6)');
      const span = document.createElement('span');
      const icon = document.createElement('i');

      span.id = 'manuscriptIdTooltip';
      span.setAttribute('tooltip-position', 'bottom');
      span.setAttribute('tooltip', 'IDs are assigned to manuscripts by target repositories.');
      icon.classList.add('fas', 'fa-info-circle', 'd-inline');

      span.appendChild(icon);
      th?.appendChild(span);
    }
  }

  formatId(id: string): string {
    const markers = ['/handle/', '/items/'];

    for (const marker of markers) {
      const index = id.indexOf(marker);
      if (index !== -1) {
        return id.slice(index + marker.length);
      }
    }

    return id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get displayIds(): any[] {
    const rc = this.repoCopies;
    if (!rc) {
      return [];
    }

    return (
      rc
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((repoCopy: any) => !!repoCopy.externalIds)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((repoCopy: any) => {
          const ids = repoCopy.externalIds.map((id: string) => ({
            title: id,
            display: this.formatId(id),
          }));
          return {
            url: repoCopy.accessUrl,
            ids,
          };
        })
    );
  }

  <template>
    <div {{didInsert this.setToolTip}}></div>
    <div {{didInsert this.setUpRepoidCell}}></div>
    {{#each this.displayIds as |idInfo|}}
      <ul class='repoid-cell'>
        {{#if idInfo.url}}
          {{#each idInfo.ids as |id|}}
            <a href='{{idInfo.url}}' target='_blank' rel='noopener noreferrer'>
              <li title='{{id.title}}'>
                {{id.display}}
              </li>
            </a>
          {{/each}}
        {{else}}
          {{#each idInfo.ids as |id|}}
            <li title='{{id.title}}'>
              {{id.display}}
            </li>
          {{/each}}
        {{/if}}
      </ul>
    {{else}}
      <span class='nodata-placeholder'>
        Not available
      </span>
    {{/each}}
  </template>
}
