import Component from '@ember/component';

export default Component.extend({
  status: Ember.computed('record.aggregatedDepositStatus', function () {
    let stat = this.get('record.aggregatedDepositStatus');
    if (stat === 'not-started') {
      return 'Not Started';
    } else if (stat === 'in-progress') {
      return 'In Progress';
    } else if (stat === 'accepted') {
      return 'Accepted';
    } else if (stat === 'stalled') {
      return 'Stalled';
    }
    return 'Undefined';
  })
});
