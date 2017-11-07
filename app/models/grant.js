import DS from 'ember-data';

export default DS.Model.extend({
  number: DS.attr('string'),
  title: DS.attr('string'),  
  agency: DS.attr('string'),
  start_date: DS.attr('date'),
  end_date: DS.attr('date'),
  external_id: DS.attr('string'),
  status: DS.attr('string'),
  pis: DS.hasMany('person'),
  submissions: DS.hasMany('submission'),
  creator: DS.belongsTo('user')
});
