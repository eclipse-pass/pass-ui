import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  icon: computed('model.config', function () {
    return `${this.get('model.config.assetsUri')}img/error-icon.png`;
  }),
  contactUrl: computed('model.config', function () {
    return `${this.get('model.config.assetsUri')}contact.html`;
  })
});
