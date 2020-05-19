import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublicationModel extends Model {
  // doi, title, abstract, journal, volume, issue
  @attr('string') doi;
  @attr('string') title;
  @attr('string') abstract;
  @attr('string') volume;
  @attr('string') issue;
  @attr('string') pmid;

  @belongsTo('journal', { autoSave: true }) journal;
  // submissions: DS.hasMany('submission', { async: true })
}
