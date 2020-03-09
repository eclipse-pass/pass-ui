import { computed } from '@ember/object';
import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service('current-user'),
  isSubmitter: computed('currentUser', function () {
    return this.get('currentUser.user.roles').includes('submitter');
  }),
});
