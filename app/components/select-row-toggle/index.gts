import Component from '@glimmer/component';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

interface SelectRowToggleSignature {
  Args: {
    clickOnRow: (index: number, record: unknown) => void;
    index: number;
    record: unknown;
    isSelected: boolean;
  };
}

export default class SelectRowToggle extends Component<SelectRowToggleSignature> {
  @action
  clickOnRow(index: number, record: unknown, event: Event) {
    this.args.clickOnRow(index, record);
    event.stopPropagation();
  }

  <template>
    <button type='button' {{on 'click' (fn this.clickOnRow @index @record)}}>
      <FaIcon @icon={{if @isSelected 'square-check' 'square'}} @prefix='far' />
    </button>
  </template>
}
