import Component from '@glimmer/component';
import { action } from '@ember/object';
import { get } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import type GrantModel from 'pass-ui/models/grant';

interface Signature {
  Args: {
    record: GrantModel;
    column: { propertyName?: string; title?: string; className?: string };
  };
}

export default class GrantLinkNewtabCell extends Component<Signature> {
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
      {{! @glint-expect-error - get with dynamic propertyName returns unknown }}
      {{get @record @column.propertyName}}
    </LinkTo>
  </template>
}
