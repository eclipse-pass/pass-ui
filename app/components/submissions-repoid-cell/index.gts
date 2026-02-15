import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import type SubmissionModel from 'pass-ui/models/submission';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';

interface DisplayIdInfo {
  url: string;
  ids: Array<{ title: string; display: string }>;
}

interface SubmissionsRepoidCellSignature {
  Args: {
    record: SubmissionModel;
  };
}

export default class SubmissionsRepoidCell extends Component<SubmissionsRepoidCellSignature> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @tracked repoCopies: RepositoryCopyModel[] | null = null;

  @action
  async setUpRepoidCell() {
    const publication = this.args.record.publication;
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

  get displayIds(): DisplayIdInfo[] {
    const rc = this.repoCopies;
    if (!rc) {
      return [];
    }

    return rc
      .filter((repoCopy: RepositoryCopyModel) => !!repoCopy.externalIds)
      .map((repoCopy: RepositoryCopyModel) => {
        const ids = repoCopy.externalIds.map((id: string) => ({
          title: id,
          display: this.formatId(id),
        }));
        return {
          url: repoCopy.accessUrl,
          ids,
        };
      });
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
