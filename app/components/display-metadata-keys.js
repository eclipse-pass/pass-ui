import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  schemaService: service('metadata-schema'),

  displayData: Ember.computed('submission', function () {
    return this.get('schemaService').displayMetadata(this.get('submission'));
  })
});
