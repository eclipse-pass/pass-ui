import Ember from 'ember';
import Base from 'ember-simple-auth/authorizers/base';
import { inject as service } from '@ember/service';

export default Base.extend({
  session: service('session'),

  authorize(sessionData, block) {
    if (this.get('session.isAuthenticated') && !Ember.isEmpty(sessionData.token)) {
      block('Authorization', `Token ${sessionData.token}`);
    }
  },
});
