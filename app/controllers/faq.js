import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['anchor'],
  anchor: '',
  showAnchor: function () {
    var _this = this;
    Ember.run.schedule('afterRender', () => {
      var elem = Ember.$(_this.anchorLocation);
      if (elem.get(0)) {
        elem.get(0).scrollIntoView(true);
      }
    });
  }.observes('anchorLocation')
});
