import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  journals: DS.hasMany('journal', {asycn:true})
});
