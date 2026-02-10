import Component from '@glimmer/component';
import { action } from '@ember/object';
import { get } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';

export default class GrantLinkNewtabCell extends Component {
  @action
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  <template>
    <LinkTo
      @route='grants.detail'
      @model={{@record.id}}
      target='_blank'
      rel='noopener noreferrer'
      {{on 'click' this.stopPropagation}}
    >
      {{get @record @column.propertyName}}
    </LinkTo>
  </template>
}
