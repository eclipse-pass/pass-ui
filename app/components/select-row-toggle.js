import Component from '@ember/component';
import layout from '../templates/components/select-row-toggle';

export default Component.extend({
  layout,
  actions: {
    clickOnRow(index, record, event) {
      this.get('clickOnRow')(index, record);
      event.stopPropagation();
    }
  }
});
