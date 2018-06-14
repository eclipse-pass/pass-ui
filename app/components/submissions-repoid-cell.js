import Component from '@ember/component';

export default Component.extend({
  didReceiveAttrs() {
    this._super(...arguments);
    if ($('#manuscriptIdTooltip').length == 0) {
      ($('.table-header:nth-child(6)')).append('<span id="manuscriptIdTooltip" tooltip-position="bottom" tooltip="ID are assigned to manuscript by target repositories."><i class="fas fa-info-circle d-inline"></i></span>');
    }
  }
});
