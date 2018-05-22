import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  /** Possible values: manuscript, supplemental, table, figure */
  fileRole: DS.attr('string'),
  uri: DS.attr('string'),
  mimeType: DS.attr('string'),
  submission: DS.belongsTo('submission'),


  // not apart of backend
  blob: null,
});
