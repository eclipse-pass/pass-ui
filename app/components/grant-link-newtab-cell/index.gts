import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import type GrantModel from 'pass-ui/models/grant';

interface Signature {
  Args: {
    record: GrantModel;
    value: unknown;
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
      {{@value}}
    </LinkTo>
  </template>
}
