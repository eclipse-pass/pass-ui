import Model, { attr, belongsTo } from '@ember-data/model';

export default class FileModel extends Model {
  @attr('string') name;
  @attr('string') description;
  /** Possible values: manuscript, supplemental, table, figure */
  @attr('string') fileRole;
  @attr('string') uri;
  @attr('string') mimeType;

  @belongsTo('submission') submission;

  // not represented on backend
  @attr('string') _file;
}
