import Component from '@ember/component';
import {get} from '@ember/object';

export default Component.extend({
  actions: {
    // Send action to parent controller
    sendAction(actionName, record) {
      get(this, 'sendAction')(actionName, record);
    }
}
});
