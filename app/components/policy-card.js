import Component from '@ember/component';

export default Component.extend({
  // checks if the radio buttons need to be displayed
  nihAndNotMethodAJournal: Ember.computed(function () { // eslint-ignore-line
    let nih = false;
    let methodA = this.get('journal.isMethodA');
    if (methodA) {
      return false;
    }
    if (this.get('policy.title') === 'National Institute of Health Public Access Policy') {
      nih = true;
    }
    return nih && !methodA;
  })
});
