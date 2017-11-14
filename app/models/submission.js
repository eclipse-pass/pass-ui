import DS from 'ember-data';

export default DS.Model.extend({
  copyright: DS.attr('string'),
  status: DS.attr('string'),
  title: DS.attr('string'),
  creator: DS.belongsTo('user'),
  creation_date: DS.attr('date'),
  grants: DS.hasMany('grant'),
});
