import Component from '@glimmer/component';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

export default class SelectRowToggle extends Component {
  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clickOnRow(index: number, record: any, event: Event) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).clickOnRow(index, record);
    event.stopPropagation();
  }

  <template>
    <button type='button' {{on 'click' (fn this.clickOnRow @index @record)}}>
      <FaIcon @icon={{if @isSelected 'square-check' 'square'}} @prefix='far' />
    </button>
  </template>
}
