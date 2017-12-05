import DS from 'ember-data';

export default DS.Model.extend({
  author: DS.belongsTo('person'),
  copyright: DS.attr('string'),
  status: DS.attr('string'),
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  creator: DS.belongsTo('user'),
  creationDate: DS.attr('date'),
  updatedDate: DS.attr('date'),
  submittedDate: DS.attr('date'),
  journal: DS.belongsTo('journal'),
  volume: DS.attr('string'),
  issue: DS.attr('string'),
  deposits: DS.hasMany('deposit', { async: true })
});
