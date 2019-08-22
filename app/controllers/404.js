import Controller from '@ember/controller';

export default Controller.extend({
  icon: Ember.computed('model.config', function () {
    return `${this.get('model.config.assetsUri')}img/error-icon.png`;
  }),
  contactUrl: Ember.computed('model.config', function () {
    return `${this.get('model.config.assetsUri')}contact.html`;
  })
});
